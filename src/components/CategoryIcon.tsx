interface CategoryIconProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

const CategoryIcon = ({ icon, label, onClick }: CategoryIconProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group"
    >
      <div className="text-4xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

export default CategoryIcon;
