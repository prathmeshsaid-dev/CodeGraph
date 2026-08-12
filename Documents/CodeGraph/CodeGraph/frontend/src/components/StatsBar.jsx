import { FileText, FolderOpen, Code2, Info, Star, GitBranch } from 'lucide-react';
import { useMemo } from 'react';

/**
 * Displays repository statistics in a row of glass cards.
 * Shows file count, folder count, detected language, and description.
 */
export default function StatsBar({ stats }) {
  if (!stats) return null;

  // Try to detect primary language from file extensions in the stats
  const language = stats.language || 'Multi-lang';

  const items = useMemo(() => [
    {
      icon: FileText,
      value: stats.files || 0,
      label: 'Files',
      variant: 'files',
    },
    {
      icon: FolderOpen,
      value: stats.folders || 0,
      label: 'Folders',
      variant: 'folders',
    },
    {
      icon: Star,
      value: stats.stars || 0,
      label: 'Stars',
      variant: 'stars',
    },
    {
      icon: GitBranch,
      value: stats.forks || 0,
      label: 'Forks',
      variant: 'forks',
    },
    {
      icon: Code2,
      value: language,
      label: 'Language',
      variant: 'lang',
    },
    {
      icon: Info,
      value: stats.description?.length > 40
        ? stats.description.slice(0, 40) + '…'
        : stats.description || 'No description',
      label: 'Description',
      variant: 'desc',
    },
  ];

  return (
    <div className="stats-bar fade-in-up">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`stat-card glass-card fade-in-up fade-in-up-delay-${i + 1}`}
        >
          <div className={`stat-icon-wrapper ${item.variant}`}>
            <item.icon size={20} />
          </div>
          <div>
            <div className={`stat-value ${i === 0 ? 'stat-value-primary' : ''}`}>
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </div>
            <div className="stat-label">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
