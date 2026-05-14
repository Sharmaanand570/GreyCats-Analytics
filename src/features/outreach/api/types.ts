export interface BroadcastStats {
  total: number;
  sent: number;
  failed: number;
  byChannel: {
    SMS?: number;
    EMAIL?: number;
    TELEGRAM?: number;
    [k: string]: number | undefined;
  };
  /**
   * When no `channel=` filter is sent, each day row is stacked by channel:
   *   { date, total, SMS, EMAIL, TELEGRAM }
   * When a `channel=` filter is sent, day rows are just `{ date, count }` for that channel.
   */
  byDay: Array<
    | { date: string; total: number; SMS?: number; EMAIL?: number; TELEGRAM?: number }
    | { date: string; count: number }
  >;
}

export interface BlogStats {
  success?: boolean;
  published: number;
  scheduled: number;
  failed: number;
  totalViews: number;
  byPlatform: Record<string, number>;
  byWeek: { date: string; count: number }[];
}

export interface OutreachStatsParams {
  clientId?: number;
  /** ISO date YYYY-MM-DD */
  from?: string;
  /** ISO date YYYY-MM-DD */
  to?: string;
}
