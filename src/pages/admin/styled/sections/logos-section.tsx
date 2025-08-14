"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
} from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ImageUp, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export type LogoItem = {
  _id: string
  name: string
  logoUrl?: string
  order: number
}

export type CreateLogoPayload = {
  name: string
  order?: number
  file?: File
  previewUrl?: string
}

export type UpdateLogoPayload = Partial<Omit<LogoItem, "_id">> & { id: string; file?: File }

export function LogosSection({
  data = [],
  isLoading = false,
  onCreate = async (_payload: CreateLogoPayload) => {},
  onUpdate = async (_payload: UpdateLogoPayload) => {},
  onDelete = async (_id: string) => {},
}: {
  data?: LogoItem[]
  isLoading?: boolean
  onCreate?: (payload: CreateLogoPayload) => Promise<void>
  onUpdate?: (payload: UpdateLogoPayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [order, setOrder] = useState<number>(0)
  const [file, setFile] = useState<File | undefined>(undefined)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="l-name">Name</Label>
              <Input id="l-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-order">Order</Label>
              <Input id="l-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="l-file">Logo File</Label>
              <div className="flex items-center gap-3">
                <Input id="l-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
                <Button variant="secondary" type="button">
                  <ImageUp className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={async () => {
                try {
                  if (!name || !file) {
                    toast({ title: "Please add a name and logo file" })
                    return
                  }
                  await onCreate({ name, order, file, previewUrl })
                  setName("")
                  setOrder(0)
                  setFile(undefined)
                } catch (e: any) {
                  toast({ title: e?.message || "Failed to create logo" })
                }
              }}
            >
              Create
            </Button>
          </div>

          {previewUrl && (
            <div className="rounded-md border bg-muted/30 p-3 max-w-sm">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="h-full w-full object-contain p-6"
                />
              </AspectRatio>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-24 w-full" />
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-5 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No logos yet. Add your first logo above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((l) => (
            <Card key={l._id}>
              <CardHeader>
                <CardTitle className="text-base">{l.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded bg-muted">
                  <img
                    src={l.logoUrl || ""}
                    alt={l.name}
                    className="h-24 w-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input defaultValue={l.name} onBlur={async (e) => { try { await onUpdate({ id: l._id, name: e.target.value }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }} />
                  <Input
                    type="number"
                    className="w-24"
                    defaultValue={l.order}
                    onBlur={async (e) => { try { await onUpdate({ id: l._id, order: Number(e.target.value) }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{l.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => { try { await onDelete(l._id) } catch (e: any) { toast({ title: e?.message || "Delete failed" }) } }}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


