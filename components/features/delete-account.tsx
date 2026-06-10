'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { jsonFetch } from '@/lib/fetcher';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export function DeleteAccount() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setPending(true);
    try {
      await jsonFetch('/api/account', { method: 'DELETE' });
      toast.success('Your account and data have been deleted.');
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete.');
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete my data</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account and data?</DialogTitle>
          <DialogDescription>
            This permanently removes your profile, every logged activity, your
            actions and goals. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending ? 'Deleting…' : 'Yes, delete everything'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
