"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/Circle";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const READ_KEY = "egt_read_notifications";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    // Keep last 200 IDs to avoid unbounded growth
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(READ_KEY, JSON.stringify(arr));
  } catch {
    /* ignore quota errors */
  }
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const firstLoad = useRef(true);

  // Sync readIds from localStorage once on mount
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setNotifications(data);

      // On the very first load, if there are no locally persisted reads,
      // pre-mark everything as read so historical items don't spam the badge.
      if (firstLoad.current) {
        firstLoad.current = false;
        const storedIds = getReadIds();
        if (storedIds.size === 0) {
          // Nothing ever read before — treat all existing as read silently
          const allIds = new Set(data.map((n: NotificationItem) => n.id));
          setReadIds(allIds);
          saveReadIds(allIds);
        }
      }
    } catch (e) {
      console.error("Notification fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    saveReadIds(allIds);
  };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Auto-mark all as read when panel is opened
    if (notifications.length > 0) {
      markAllRead();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          color: "#94a3b8",
          "&:hover": { color: "#fff", bgcolor: "rgba(255, 255, 255, 0.05)" },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              bgcolor: "#1e293b",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              borderRadius: 2,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#f8fafc" }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={markAllRead}
              sx={{ color: "#6366f1", fontSize: "0.72rem", textTransform: "none", p: 0.5 }}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* List */}
        <List sx={{ maxHeight: 340, overflowY: "auto", py: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", color: "#94a3b8" }}>
              <Typography variant="body2">No recent notifications</Typography>
            </Box>
          ) : (
            notifications.map((item) => {
              const isUnread = !readIds.has(item.id);
              return (
                <Box
                  key={item.id}
                  onClick={() => {
                    // Mark single item read on click
                    const next = new Set(readIds);
                    next.add(item.id);
                    setReadIds(next);
                    saveReadIds(next);
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: isUnread ? "rgba(99, 102, 241, 0.06)" : "transparent",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                      transition: "background 0.2s",
                    }}
                  >
                    <CircleIcon
                      sx={{
                        fontSize: 8,
                        mr: 1.5,
                        color: isUnread ? "#6366f1" : "transparent",
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: isUnread ? 700 : 500, color: "#f8fafc" }}
                        >
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{ display: "block" }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#94a3b8", display: "block" }}
                          >
                            {item.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />
                </Box>
              );
            })
          )}
        </List>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
            <Box sx={{ p: 1.5, textAlign: "center" }}>
              <Typography variant="caption" sx={{ color: "#475569" }}>
                {notifications.length} recent · {unreadCount} unread
              </Typography>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
}
