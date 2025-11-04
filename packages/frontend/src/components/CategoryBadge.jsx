/**
 * CategoryBadge Component
 * Displays a colored badge for task category
 */

const getCategoryColor = (category) => {
  const colors = {
    Work: '#6366f1',
    Personal: '#ec4899',
    Shopping: '#fb923c',
    Health: '#22c55e',
    Finance: '#3b82f6',
    Education: '#a855f7',
    Home: '#ef4444',
    Other: '#6b7280',
  };
  return colors[category] || '#6b7280';
};

export const CategoryBadge = ({ category }) => {
  return (
    <span
      className="category-badge"
      style={{
        backgroundColor: `${getCategoryColor(category)}dd`,
        color: '#ffffff',
      }}
      title={category}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
