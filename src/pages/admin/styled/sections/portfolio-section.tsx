"use client"

import { useMemo, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
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
import { ImageUp, Trash2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type PortfolioItem = {
  _id: string
  title: string
  description: string
  category: "Weddings" | "Corporate" | "Livefeed" | (string & {})
  coverUrl?: string
  order: number
  isPublished: boolean
}

export type CreatePortfolioPayload = {
  title: string
  description: string
  category: "Weddings" | "Corporate" | "Livefeed"
  order?: number
  isPublished?: boolean
  file?: File
  previewUrl?: string
}

export type UpdatePortfolioPayload = Partial<Omit<PortfolioItem, "_id">> & {
  id: string
  file?: File
  coverImageStorageId?: string
}

const categories = ["Weddings", "Corporate", "Livefeed"] as const

export function PortfolioSection({
  data = [],
  isLoading = false,
  onCreate = async (_payload: CreatePortfolioPayload) => {},
  onUpdate = async (_payload: UpdatePortfolioPayload) => {},
  onDelete = async (_id: string) => {},
  // Optional helpers for bulk upload with progress
  uploadToStorage,
  createFromStorage,
  addPhotoToAlbum,
}: {
  data?: PortfolioItem[]
  isLoading?: boolean
  onCreate?: (payload: CreatePortfolioPayload) => Promise<void>
  onUpdate?: (payload: UpdatePortfolioPayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  uploadToStorage?: (file: File, onProgress?: (pct: number) => void) => Promise<string>
  createFromStorage?: (meta: { title: string; description: string; category: string; storageId: string; order?: number; isPublished?: boolean }) => Promise<void>
  addPhotoToAlbum?: (albumId: string, storageId: string, order: number) => Promise<void>
}) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState<(typeof categories)[number]>("Livefeed")
  const [order, setOrder] = useState<number>(0)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [bulkFiles, setBulkFiles] = useState<File[] | undefined>(undefined)
  const [isPublished, setIsPublished] = useState(true)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null)
  const [previews, setPreviews] = useState<{ file: File; url: string; progress: number }[]>([])

  // Photos of the selected album (admin view)
  const albumPhotos = useQuery(
    activeAlbumId ? (api.portfolio.listAlbumPhotos as any) : ("skip" as any),
    activeAlbumId ? ({ albumId: activeAlbumId } as any) : ("skip" as any)
  ) as any[] | undefined

  const filenameToTitle = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[\-_]+/g, " ").trim()

  // Resize utilities
  async function createWebpFromImage(
    file: File,
    opts: { mode: "cover" | "contain"; width: number; height?: number; quality?: number }
  ): Promise<Blob> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const i = new Image()
      i.onload = () => { URL.revokeObjectURL(url); resolve(i) }
      i.onerror = reject
      i.src = url
    })

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const targetW = opts.width
    const targetH = opts.height ?? Math.round((img.height / img.width) * targetW)
    canvas.width = targetW
    canvas.height = targetH

    if (opts.mode === "cover") {
      const srcRatio = img.width / img.height
      const dstRatio = targetW / targetH
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (srcRatio > dstRatio) {
        // source is wider → crop left/right
        const newSw = Math.round(img.height * dstRatio)
        sx = Math.round((img.width - newSw) / 2)
        sw = newSw
      } else {
        // source is taller → crop top/bottom
        const newSh = Math.round(img.width / dstRatio)
        sy = Math.round((img.height - newSh) / 2)
        sh = newSh
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH)
    } else {
      // contain
      const scale = Math.min(targetW / img.width, targetH / img.height)
      const dw = Math.round(img.width * scale)
      const dh = Math.round(img.height * scale)
      const dx = Math.round((targetW - dw) / 2)
      const dy = Math.round((targetH - dh) / 2)
      ctx.fillStyle = "#ffffff00"
      ctx.fillRect(0, 0, targetW, targetH)
      ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh)
    }

    const q = opts.quality ?? 0.82
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/webp", q))
    return blob
  }

  async function createLargeDisplayWebp(file: File): Promise<Blob> {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const i = new Image()
      i.onload = () => { URL.revokeObjectURL(url); resolve(i) }
      i.onerror = reject
      i.src = url
    })
    const maxEdge = 2048
    const scale = Math.min(maxEdge / img.width, maxEdge / img.height, 1)
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, w, h)
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/webp", 0.82))
    return blob
  }

  const selectedAlbum = useMemo(() => data.find(d => d._id === activeAlbumId), [data, activeAlbumId])

  const handleBulkUpload = async () => {
    if (!bulkFiles || bulkFiles.length === 0) {
      toast({ title: "Please select images for bulk upload" })
      return
    }
    if (!activeAlbumId) {
      toast({ title: "Please select an album (click a card)" })
      return
    }
    setIsBulkUploading(true)
    try {
      let nextOrder = Number(order) || 0
      // If advanced upload helpers are provided, use them for progress
      if (uploadToStorage && addPhotoToAlbum) {
        const local = previews.length > 0 ? previews : (bulkFiles || []).map(f => ({ file: f, url: URL.createObjectURL(f), progress: 0 }))
        setPreviews(local)
        for (let i = 0; i < local.length; i++) {
          const item = local[i]
          // Prepare standardized variants
          const coverBlob = await createWebpFromImage(item.file, { mode: "cover", width: 1200, height: 675, quality: 0.8 })
          const largeBlob = await createLargeDisplayWebp(item.file)

          // Upload large variant (photo)
          const storageId = await uploadToStorage(largeBlob as unknown as File, (pct) => {
            setPreviews(prev => prev.map((p, idx) => idx === i ? { ...p, progress: pct } : p))
          })
          await addPhotoToAlbum(activeAlbumId, storageId, nextOrder)
          nextOrder += 1
          // If the album likely has no cover yet, set the first uploaded image as cover using the prepared cover variant
          if (i === 0 && onUpdate) {
            const coverFile = new File([coverBlob], `cover-${Date.now()}.webp`, { type: coverBlob.type })
            await onUpdate({ id: activeAlbumId, file: coverFile })
          }
        }
      } else {
        toast({ title: "Bulk upload requires album photo API; please refresh and try again." })
      }
      setBulkFiles(undefined)
      setPreviews([])
      toast({ title: "Bulk upload completed" })
    } catch (e) {
      toast({ title: "Bulk upload failed" })
    } finally {
      setIsBulkUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add Portfolio Album</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-title">Title</Label>
              <Input
                id="p-title"
                placeholder="e.g., Garden Ceremony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as (typeof categories)[number])}>
                <SelectTrigger id="p-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-order">Order</Label>
              <Input id="p-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="p-file">Cover Image</Label>
              <div className="flex items-center gap-3">
                <Input id="p-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
                <Button variant="secondary" type="button">
                  <ImageUp className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {/* Bulk upload */}
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="p-bulk-files">Bulk Photos for Selected Album (drag & drop or select)</Label>
              <div
                className="rounded-md border border-dashed p-4 text-center bg-muted/20"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
                  setBulkFiles(files)
                  setPreviews(files.map(f => ({ file: f, url: URL.createObjectURL(f), progress: 0 })))
                }}
              >
                <div className="text-xs text-muted-foreground mb-2">Drag and drop images here</div>
                <Input
                  id="p-bulk-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : undefined
                    setBulkFiles(files)
                    setPreviews(files ? files.map(f => ({ file: f, url: URL.createObjectURL(f), progress: 0 })) : [])
                  }}
                />
              </div>
              {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative rounded border overflow-hidden">
                      <AspectRatio ratio={16/9}>
                        <img src={p.url} alt={p.file.name} className="absolute inset-0 h-full w-full object-cover" />
                      </AspectRatio>
                      <div className="p-2 text-xs truncate">{p.file.name}</div>
                      {isBulkUploading && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                          <div className="h-1 bg-accent" style={{ width: `${p.progress}%` }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" type="button" disabled={isBulkUploading || !bulkFiles?.length} onClick={handleBulkUpload}>
                  <ImageUp className="h-4 w-4 mr-2" />
                  {isBulkUploading ? "Uploading…" : `Bulk Upload${bulkFiles?.length ? ` (${bulkFiles.length})` : ''}`}
                </Button>
                {previews.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => { setBulkFiles(undefined); setPreviews([]) }} disabled={isBulkUploading}>Clear</Button>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="p-desc">Description</Label>
              <Input
                id="p-desc"
                placeholder="Short summary..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="p-pub" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="p-pub" className="cursor-pointer">
                Published
              </Label>
            </div>
            <Button
              onClick={async () => {
                if (!title || !file) {
                  toast({ title: "Please add a title and image" })
                  return
                }
                await onCreate({ title, description: desc, category, order, isPublished, file, previewUrl })
                setTitle("")
                setDesc("")
                setOrder(0)
                setIsPublished(true)
                setFile(undefined)
              }}
            >
              Create
            </Button>
          </div>

          {previewUrl && (
            <div className="rounded-md border bg-muted/30 p-3">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover rounded"
                />
              </AspectRatio>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="space-y-3 pt-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No portfolio items yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((p) => (
            <Card
              key={p._id}
              className={`relative overflow-hidden cursor-pointer transition-shadow ${activeAlbumId === p._id ? 'ring-2 ring-accent shadow-lg' : 'hover:shadow-md'}`}
              onClick={() => setActiveAlbumId(p._id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <Badge variant="secondary">{p.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={cn("rounded-md bg-muted overflow-hidden")}> 
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={p.coverUrl || ""}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>

                <Input defaultValue={p.title} onBlur={(e) => onUpdate({ id: p._id, title: e.target.value })} />
                <Input
                  defaultValue={p.description}
                  onBlur={(e) => onUpdate({ id: p._id, description: e.target.value })}
                />

                <Select defaultValue={p.category} onValueChange={(val) => onUpdate({ id: p._id, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    className="w-28"
                    type="number"
                    defaultValue={p.order}
                    onBlur={(e) => onUpdate({ id: p._id, order: Number(e.target.value) })}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`pub-${p._id}`}
                      checked={p.isPublished}
                      onCheckedChange={(checked) => onUpdate({ id: p._id, isPublished: checked })}
                    />
                    <Label htmlFor={`pub-${p._id}`} className="cursor-pointer text-sm">
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
                        <AlertDialogTitle>Delete “{p.title}”?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(p._id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {activeAlbumId === p._id && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[10px] font-medium text-white shadow">
                    <CheckCircle2 className="h-3 w-3" /> Selected for bulk upload
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {activeAlbumId && (
        <div className="text-xs text-muted-foreground">
          Selected album for bulk upload: <span className="font-medium">{selectedAlbum?.title || activeAlbumId}</span>
        </div>
      )}
    </div>
  )
}


