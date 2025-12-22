import { Link } from 'react-router-dom';

interface CategoryIconProps {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

const CategoryIcon = ({ icon, label, href, onClick }: CategoryIconProps) => {
  const content = (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors group cursor-pointer">
      <div className="text-4xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return (
    <button onClick={onClick}>
      {content}
    </button>
  );
};

export default CategoryIcon;
