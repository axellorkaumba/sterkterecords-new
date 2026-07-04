import { getTranslations } from "next-intl/server";
import { BellIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Database } from "@/types/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export async function NotificationsCard({ notifications }: { notifications: Notification[] }) {
  const t = await getTranslations("Dashboard.notifications");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <EmptyState icon={BellIcon} title={t("emptyTitle")} description={t("emptyDescription")} />
        ) : (
          <ul className="flex flex-col gap-3">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex items-start gap-2">
                <span
                  className={
                    notification.read_at
                      ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-transparent"
                      : "bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                  }
                  aria-hidden="true"
                />
                <div>
                  <p className="text-small">{notification.type}</p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
