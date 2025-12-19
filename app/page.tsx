 "use client" 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDirection } from '@radix-ui/react-direction';

export default function Home() {
  const direction = useDirection();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir={direction}>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Action</AlertDialogTitle>
          <AlertDialogDescription>
            Once confirmed, this action cannot be reversed. It will delete your account and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction>Proceed</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
