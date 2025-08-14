"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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

export type GalleryItem = {
  _id: string
  title: string
  description: string
  badge: string
  iconName: "Play" | "Camera" | "Zap" | (string & {})
  imageUrl?: string
  order: number
  isPublished: boolean
}

export type CreateGalleryPayload = {
  title: string
  description: string
  badge?: string
  iconName?: "Play" | "Camera" | "Zap"
  order?: number
  isPublished?: boolean
  file?: File
  previewUrl?: string
}

export type UpdateGalleryPayload = Partial<Omit<GalleryItem, "_id">> & { id: string; file?: File }

export function GallerySection({
  data = [],
  isLoading = false,
  onCreate = async (_payload: CreateGalleryPayload) => {},
  onUpdate = async (_payload: UpdateGalleryPayload) => {},
  onDelete = async (_id: string) => {},
}: {
  data?: GalleryItem[]
  isLoading?: boolean
  onCreate?: (payload: CreateGalleryPayload) => Promise<void>
  onUpdate?: (payload: UpdateGalleryPayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [badge, setBadge] = useState("Badge")
  const [iconName, setIconName] = useState<"Play" | "Camera" | "Zap">("Play")
  const [order, setOrder] = useState<number>(0)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [isPublished, setIsPublished] = useState(true)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add Gallery Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Badge (e.g., Livefeed)" value={badge} onChange={(e) => setBadge(e.target.value)} />
            <Input
              placeholder="Icon (Play|Camera|Zap)"
              value={iconName}
              onChange={(e) => setIconName((e.target.value as "Play" | "Camera" | "Zap") || "Play")}
            />
            <Input type="number" placeholder="Order" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            <Input
              placeholder="Description"
              className="md:col-span-2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-file">Image (optional)</Label>
            <div className="flex items-center gap-3">
              <Input id="g-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
              <Button variant="secondary" type="button">
                <ImageUp className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="g-pub" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="g-pub" className="cursor-pointer">
                Published
              </Label>
            </div>
            <Button
              onClick={async () => {
                try {
                  if (!title) {
                    toast({ title: "Please add a title" })
                    return
                  }
                  await onCreate({ title, description: desc, badge, iconName, order, isPublished, file, previewUrl })
                  setTitle("")
                  setDesc("")
                  setOrder(0)
                  setBadge("Badge")
                  setIconName("Play")
                  setIsPublished(true)
                  setFile(undefined)
                } catch (e: any) {
                  toast({ title: e?.message || "Failed to create item" })
                }
              }}
            >
              Create
            </Button>
          </div>

          {previewUrl && (
            <div className="rounded-md border bg-muted/30 p-3 max-w-2xl">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              </AspectRatio>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-24 w-full" />
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No gallery items yet. Add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((item) => (
            <Card key={item._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge>{item.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.imageUrl && (
                  <div className="rounded bg-muted overflow-hidden">
                    <img
                      src={item.imageUrl || ""}
                      alt={item.title}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                )}
                <Input defaultValue={item.title} onBlur={async (e) => { try { await onUpdate({ id: item._id, title: e.target.value }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }} />
                <Input
                  defaultValue={item.description}
                  onBlur={async (e) => { try { await onUpdate({ id: item._id, description: e.target.value }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      try { await onUpdate({ id: item._id, file: f }) } catch (e: any) { toast({ title: e?.message || "Upload failed" }) }
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                    className="w-28"
                    type="number"
                    defaultValue={item.order}
                      onBlur={async (e) => { try { await onUpdate({ id: item._id, order: Number(e.target.value) }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`gpub-${item._id}`}
                      checked={item.isPublished}
                        onCheckedChange={async (checked) => { try { await onUpdate({ id: item._id, isPublished: checked }) } catch (e: any) { toast({ title: e?.message || "Update failed" }) } }}
                    />
                    <Label htmlFor={`gpub-${item._id}`} className="cursor-pointer text-sm">
                      Published
                    </Label>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{item.title}”?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => { try { await onDelete(item._id) } catch (e: any) { toast({ title: e?.message || "Delete failed" }) } }}>Delete</AlertDialogAction>
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


