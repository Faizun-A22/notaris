import React from 'react';

export const MetricCard = ({ title, value, icon, change, changeText, color = 'primary', footerText }) => {
  // Styles based on color theme
  let iconBg = 'bg-primary-container/20 text-primary';
  let decorBg = 'bg-primary/5';
  let titleColor = 'text-primary';

  if (color === 'secondary') {
    iconBg = 'bg-secondary-container/30 text-secondary';
    decorBg = 'bg-secondary-container/20';
    titleColor = 'text-secondary';
  } else if (color === 'error') {
    iconBg = 'bg-error-container/30 text-error';
    decorBg = 'bg-error-container/20';
    titleColor = 'text-error';
  } else if (color === 'tertiary') {
    iconBg = 'bg-tertiary-fixed text-on-tertiary-fixed';
    decorBg = 'bg-tertiary-fixed-dim/25';
    titleColor = 'text-on-surface';
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      <div className={`absolute right-0 top-0 w-24 h-24 ${decorBg} rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
      
      <div className="flex items-start justify-between mb-2">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
            {icon}
          </span>
        </div>
        {change && (
          <span className={`${color === 'primary' ? 'text-on-surface-variant' : color === 'secondary' ? 'text-secondary' : 'text-error'} font-label-bold text-label-sm`}>
            {change}
          </span>
        )}
      </div>

      <p className="text-on-surface-variant font-label-bold text-label-sm uppercase tracking-wider">
        {title}
      </p>
      
      <h3 className={`font-headline-lg text-headline-lg ${titleColor} mt-1`}>
        {value}
      </h3>

      {footerText && (
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <p className="text-[10px] text-on-surface-variant">{footerText}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
