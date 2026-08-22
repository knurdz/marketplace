"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, MessageSquare, Package, UserRound } from "lucide-react";
import { signOut } from "@/lib/appwrite/auth";
import type { SessionUserView } from "@/lib/appwrite/session-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AccountMenuProps = {
  user: SessionUserView;
  displayName?: string | null;
  avatarUrl?: string | null;
};

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "K") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase().slice(0, 2);
}

export function AccountMenu({ user, displayName, avatarUrl }: AccountMenuProps) {
  const label = displayName?.trim() || user.name.trim() || user.email;
  const initials = initialsFrom(label, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          aria-label="Account menu"
        >
          <Avatar className="size-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-foreground">{label}</span>
          <span className="mt-0.5 block truncate font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders">
              <Package />
              Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">
              <MessageSquare />
              Messages
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wishlist">Wishlist</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <UserRound />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
