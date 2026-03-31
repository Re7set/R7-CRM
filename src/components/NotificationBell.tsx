import { useCRM } from './CRMProvider';
import { useMarkNotificationRead } from '@/hooks/useSupabaseQueries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationBell() {
  const { notifications, deals, setSelectedDeal, setViewMode } = useCRM();
  const markRead = useMarkNotificationRead();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleClick = (notif: typeof notifications[0]) => {
    if (!notif.is_read) markRead.mutate(notif.id);
    if (notif.deal_id) {
      const deal = deals.find(d => d.id === notif.deal_id);
      if (deal) {
        setViewMode('pipeline');
        setSelectedDeal(deal);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="px-3 py-2.5 border-b border-border/40">
          <span className="text-xs font-bold">Notifications</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">Aucune notification</div>
          ) : notifications.slice(0, 20).map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-3 py-2.5 border-b border-border/20 hover:bg-muted/30 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
            >
              <p className="text-xs font-medium">{n.title}</p>
              {n.body && <p className="text-[10px] text-muted-foreground mt-0.5">{n.body}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">
                {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true, locale: fr })}
              </p>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
