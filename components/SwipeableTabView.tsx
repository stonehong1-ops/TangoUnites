import React, { useState, useMemo, useEffect } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface SwipeableTabViewProps {
  tabs: Tab[];
  initialTabId?: string;
  stickyHeader?: boolean;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const SwipeableTabView: React.FC<SwipeableTabViewProps> = ({ tabs, initialTabId, stickyHeader = false, onTabChange, className = '' }) => {
  const [activeTabId, setActiveTabId] = useState(initialTabId || (tabs.length > 0 ? tabs[0].id : ''));
  const activeIndex = useMemo(() => {
      const index = tabs.findIndex(tab => tab.id === activeTabId);
      return index === -1 ? 0 : index;
  }, [tabs, activeTabId]);

  useEffect(() => {
    if (initialTabId && tabs.some(t => t.id === initialTabId)) {
      setActiveTabId(initialTabId);
    } else if (tabs.length > 0) {
      setActiveTabId(tabs[0].id);
    }
  }, [initialTabId, tabs]);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  
  const changeTab = (tabId: string) => {
    setActiveTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < tabs.length - 1) {
      changeTab(tabs[activeIndex + 1].id);
    } else if (isRightSwipe && activeIndex > 0) {
      changeTab(tabs[activeIndex - 1].id);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap px-4 ${isActive ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'}`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );

  return (
    <div className={className}>
      <div className={`${stickyHeader ? 'sticky top-[56px] z-20 bg-white/90 backdrop-blur-sm -mx-4' : ''}`}>
        <div className="flex px-2 border-b border-gray-200 overflow-x-auto scrollbar-hide" role="tablist">
          {tabs.map(tab => (
            <TabButton key={tab.id} label={tab.label} isActive={activeTabId === tab.id} onClick={() => changeTab(tab.id)} />
          ))}
        </div>
      </div>

      <div
        className="mt-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-x-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {tabs.map(tab => (
              <div key={tab.id} className="w-full flex-shrink-0 align-top px-1 min-h-[50vh]" role="tabpanel">
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableTabView;
