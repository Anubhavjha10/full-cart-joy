import { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Download,
  Loader2,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedRow {
  rowNumber: number;
  data: {
    product_name: string;
    category: string;
    price: number;
    mrp: number;
    stock_quantity: number;
    unit: string;
    description: string;
    image_url: string;
    is_active: boolean;
  };
  errors: string[];
  status: 'pending' | 'valid' | 'invalid' | 'imported' | 'skipped' | 'updated';
}

interface ImportSummary {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  updated: number;
}

const REQUIRED_COLUMNS = ['product_name', 'category', 'price', 'mrp', 'stock_quantity', 'unit'];
const ALL_COLUMNS = [...REQUIRED_COLUMNS, 'description', 'image_url', 'is_active'];

const SAMPLE_DATA = `product_name,category,price,mrp,stock_quantity,unit,description,image_url,is_active
Amul Butter,Dairy,58,65,100,100 g,Fresh butter for your breakfast,https://example.com/butter.jpg,true
Fresh Tomatoes,Vegetables,25,30,50,500 g,Farm fresh tomatoes,,true
Lays Chips,Snacks,20,25,200,90 g,Crispy potato chips,,true`;

const AdminBulkImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [categories, setCategories] = useState<Map<string, string>>(new Map());
  
  // Import options
  const [createNewCategories, setCreateNewCategories] = useState(true);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update'>('skip');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing categories
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug');
    
    if (!error && data) {
      const catMap = new Map<string, string>();
      data.forEach(cat => {
        catMap.set(cat.name.toLowerCase(), cat.id);
        catMap.set(cat.slug.toLowerCase(), cat.id);
      });
      setCategories(catMap);
    }
  }, []);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Validate a single row
  const validateRow = (row: Record<string, unknown>, rowNumber: number): ParsedRow => {
    const errors: string[] = [];
    
    // Check required fields
    const productName = String(row['product_name'] || '').trim();
    const category = String(row['category'] || '').trim();
    const priceRaw = row['price'];
    const mrpRaw = row['mrp'];
    const stockRaw = row['stock_quantity'];
    const unit = String(row['unit'] || '').trim();
    
    if (!productName) errors.push('Product name is required');
    if (!category) errors.push('Category is required');
    if (!unit) errors.push('Unit is required');
    
    // Validate price
    const price = Number(priceRaw);
    if (isNaN(price) || price < 0) {
      errors.push('Price must be a valid positive number');
    }
    
    // Validate MRP
    const mrp = Number(mrpRaw);
    if (isNaN(mrp) || mrp < 0) {
      errors.push('MRP must be a valid positive number');
    }
    
    // Validate stock
    const stock = Number(stockRaw);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      errors.push('Stock quantity must be a valid positive integer');
    }
    
    // Validate price vs MRP
    if (!isNaN(price) && !isNaN(mrp) && price > mrp) {
      errors.push('Price cannot be greater than MRP');
    }
    
    // Parse is_active
    const isActiveRaw = row['is_active'];
    let isActive = true;
    if (isActiveRaw !== undefined && isActiveRaw !== '') {
      const activeStr = String(isActiveRaw).toLowerCase();
      isActive = activeStr === 'true' || activeStr === '1' || activeStr === 'yes';
    }
    
    return {
      rowNumber,
      data: {
        product_name: productName,
        category,
        price: isNaN(price) ? 0 : price,
        mrp: isNaN(mrp) ? 0 : mrp,
        stock_quantity: isNaN(stock) ? 0 : Math.floor(stock),
        unit,
        description: String(row['description'] || '').trim(),
        image_url: String(row['image_url'] || '').trim(),
        is_active: isActive,
      },
      errors,
      status: errors.length > 0 ? 'invalid' : 'valid',
    };
  };

  // Parse file
  const parseFile = async (file: File) => {
    setIsParsing(true);
    setParsedRows([]);
    setImportSummary(null);
    
    try {
      await fetchCategories();
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast.error('The file is empty or has no valid data');
        setIsParsing(false);
        return;
      }
      
      // Validate columns
      const firstRow = jsonData[0] as Record<string, unknown>;
      const columns = Object.keys(firstRow).map(c => c.toLowerCase().replace(/\s+/g, '_'));
      const missingColumns = REQUIRED_COLUMNS.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
        setIsParsing(false);
        return;
      }
      
      // Normalize column names and validate rows
      const normalizedData = jsonData.map((row, index) => {
        const normalizedRow: Record<string, unknown> = {};
        Object.entries(row as Record<string, unknown>).forEach(([key, value]) => {
          const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
          normalizedRow[normalizedKey] = value;
        });
        return validateRow(normalizedRow, index + 2); // +2 for 1-indexed + header row
      });
      
      setParsedRows(normalizedData);
      setShowPreview(true);
      
      const validCount = normalizedData.filter(r => r.status === 'valid').length;
      const invalidCount = normalizedData.filter(r => r.status === 'invalid').length;
      
      toast.success(`Parsed ${normalizedData.length} rows: ${validCount} valid, ${invalidCount} with errors`);
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setIsParsing(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(selectedFile.type) && !['csv', 'xlsx', 'xls'].includes(extension || '')) {
        toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
        return;
      }
      
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  // Get or create category
  const getOrCreateCategory = async (categoryName: string): Promise<string | null> => {
    const normalizedName = categoryName.toLowerCase();
    
    // Check if category exists
    if (categories.has(normalizedName)) {
      return categories.get(normalizedName)!;
    }
    
    if (!createNewCategories) {
      return null;
    }
    
    // Create new category
    const slug = generateSlug(categoryName);
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryName,
        slug,
        is_active: true,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to create category:', error);
      return null;
    }
    
    // Update cache
    categories.set(normalizedName, data.id);
    categories.set(slug, data.id);
    
    return data.id;
  };

  // Check for duplicate product
  const checkDuplicate = async (name: string, slug: string): Promise<{ exists: boolean; id?: string }> => {
    const { data } = await supabase
      .from('admin_products')
      .select('id')
      .or(`name.eq.${name},slug.eq.${slug}`)
      .maybeSingle();
    
    return { exists: !!data, id: data?.id };
  };

  // Import products
  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }
    
    setIsImporting(true);
    setProgress(0);
    
    const summary: ImportSummary = {
      total: validRows.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      updated: 0,
    };
    
    const batchSize = 10;
    const updatedRows = [...parsedRows];
    
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (row) => {
        const rowIndex = updatedRows.findIndex(r => r.rowNumber === row.rowNumber);
        
        try {
          // Get or create category
          const categoryId = await getOrCreateCategory(row.data.category);
          
          if (!categoryId) {
            updatedRows[rowIndex] = {
              ...row,
              status: 'invalid',
              errors: [...row.errors, `Category "${row.data.category}" not found and auto-create is disabled`],
            };
            summary.failed++;
            return;
          }
          
          const slug = generateSlug(row.data.product_name);
          
          // Check for duplicates
          const { exists, id: existingId } = await checkDuplicate(row.data.product_name, slug);
          
          if (exists) {
            if (duplicateHandling === 'skip') {
              updatedRows[rowIndex] = { ...row, status: 'skipped' };
              summary.skipped++;
              return;
            }
            
            // Update existing product
            const { error } = await supabase
              .from('admin_products')
              .update({
                name: row.data.product_name,
                slug,
                category_id: categoryId,
                price: row.data.price,
                mrp: row.data.mrp,
                stock: row.data.stock_quantity,
                unit: row.data.unit,
                description: row.data.description || null,
                image_url: row.data.image_url || null,
                is_active: row.data.is_active,
                discount_percentage: row.data.mrp > 0 
                  ? Math.round(((row.data.mrp - row.data.price) / row.data.mrp) * 100) 
                  : 0,
              })
              .eq('id', existingId);
            
            if (error) throw error;
            
            updatedRows[rowIndex] = { ...row, status: 'updated' };
            summary.updated++;
            return;
          }
          
          // Insert new product
          const { error } = await supabase
            .from('admin_products')
            .insert({
              name: row.data.product_name,
              slug,
              category_id: categoryId,
              price: row.data.price,
              mrp: row.data.mrp,
              stock: row.data.stock_quantity,
              unit: row.data.unit,
              description: row.data.description || null,
              image_url: row.data.image_url || null,
              is_active: row.data.is_active,
              discount_percentage: row.data.mrp > 0 
                ? Math.round(((row.data.mrp - row.data.price) / row.data.mrp) * 100) 
                : 0,
            });
          
          if (error) throw error;
          
          updatedRows[rowIndex] = { ...row, status: 'imported' };
          summary.successful++;
        } catch (error) {
          console.error('Import error for row', row.rowNumber, error);
          updatedRows[rowIndex] = {
            ...row,
            status: 'invalid',
            errors: [...row.errors, 'Database error during import'],
          };
          summary.failed++;
        }
      }));
      
      setParsedRows([...updatedRows]);
      setProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }
    
    setImportSummary(summary);
    setIsImporting(false);
    setProgress(100);
    
    toast.success(`Import complete: ${summary.successful} added, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.failed} failed`);
  };

  // Download error report
  const downloadErrorReport = () => {
    const errorRows = parsedRows.filter(r => r.status === 'invalid');
    
    if (errorRows.length === 0) {
      toast.info('No errors to export');
      return;
    }
    
    const csvContent = [
      ['Row Number', 'Product Name', 'Category', 'Errors'].join(','),
      ...errorRows.map(r => [
        r.rowNumber,
        `"${r.data.product_name}"`,
        `"${r.data.category}"`,
        `"${r.errors.join('; ')}"`,
      ].join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `import-errors-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download sample template
  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_DATA], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setShowPreview(false);
    setImportSummary(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bulk Import Products</h1>
          <p className="text-muted-foreground mt-1">
            Upload CSV or Excel files to add multiple products at once
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Supported formats: CSV, XLSX, XLS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {isParsing ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Parsing file...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-4">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Maximum 1000 rows per file
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Required Columns Info */}
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required Columns</AlertTitle>
            <AlertDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {REQUIRED_COLUMNS.map(col => (
                  <Badge key={col} variant="secondary">{col}</Badge>
                ))}
              </div>
              <p className="mt-2 text-sm">
                Optional: {ALL_COLUMNS.filter(c => !REQUIRED_COLUMNS.includes(c)).join(', ')}
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import Options */}
      {parsedRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="create-categories">Auto-create new categories</Label>
                <p className="text-sm text-muted-foreground">
                  Create categories if they don't exist in the database
                </p>
              </div>
              <Switch
                id="create-categories"
                checked={createNewCategories}
                onCheckedChange={setCreateNewCategories}
              />
            </div>

            <div className="space-y-3">
              <Label>Duplicate Handling</Label>
              <RadioGroup
                value={duplicateHandling}
                onValueChange={(v) => setDuplicateHandling(v as 'skip' | 'update')}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip" className="font-normal">
                    Skip duplicates (don't import if product already exists)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="update" id="update" />
                  <Label htmlFor="update" className="font-normal">
                    Update existing products with new data
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {parsedRows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {parsedRows.length} rows parsed • {validCount} valid • {invalidCount} with errors
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {invalidCount > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Errors
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showPreview && (
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow 
                        key={row.rowNumber}
                        className={row.status === 'invalid' ? 'bg-destructive/5' : ''}
                      >
                        <TableCell className="font-mono text-sm">{row.rowNumber}</TableCell>
                        <TableCell>
                          {row.status === 'valid' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          )}
                          {row.status === 'invalid' && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                          {row.status === 'imported' && (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Imported
                            </Badge>
                          )}
                          {row.status === 'updated' && (
                            <Badge className="bg-blue-500">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Updated
                            </Badge>
                          )}
                          {row.status === 'skipped' && (
                            <Badge variant="secondary">
                              Skipped
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {row.data.product_name}
                        </TableCell>
                        <TableCell>{row.data.category}</TableCell>
                        <TableCell className="text-right">₹{row.data.price}</TableCell>
                        <TableCell className="text-right">₹{row.data.mrp}</TableCell>
                        <TableCell className="text-right">{row.data.stock_quantity}</TableCell>
                        <TableCell>{row.data.unit}</TableCell>
                        <TableCell className="max-w-[200px]">
                          {row.errors.length > 0 && (
                            <span className="text-sm text-destructive">
                              {row.errors.join('; ')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      )}

      {/* Progress Section */}
      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Importing Products...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {progress}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      {importSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importSummary.total}</p>
                <p className="text-sm text-muted-foreground">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importSummary.successful}</p>
                <p className="text-sm text-muted-foreground">Imported</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{importSummary.updated}</p>
                <p className="text-sm text-muted-foreground">Updated</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{importSummary.skipped}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{importSummary.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
            
            {importSummary.failed > 0 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={downloadErrorReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {parsedRows.length > 0 && !importSummary && (
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={validCount === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Products
              </>
            )}
          </Button>
        </div>
      )}

      {/* Start Over Button after import */}
      {importSummary && (
        <div className="flex justify-center">
          <Button onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Start New Import
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminBulkImport;
