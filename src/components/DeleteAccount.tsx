import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function DeleteAccount() {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch('/api/account/delete', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Redirect to home after successful deletion
      window.location.href = '/'
    } catch (error) {
      toast({
        title: "Account deletion failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          Permanently remove your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Account Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently:
                <ul className="list-disc pl-6 mt-2">
                  <li>Delete your profile information</li>
                  <li>Remove all meeting records</li>
                  <li>Cancel any active subscriptions</li>
                  <li>Delete uploaded files</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm Permanent Deletion
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}