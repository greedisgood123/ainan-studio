"use client"

import { useMemo, useState } from "react"
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
import { ImageUp, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export type PortfolioItem = {
  _id: string
  title: string
  description: string
  category: "Weddings" | "Corporate" | "Livefeed" | (string & {})
  imageUrl?: string
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
}

const categories = ["Weddings", "Corporate", "Livefeed"] as const

export function PortfolioSection({
  data = [],
  isLoading = false,
  onCreate = async (_payload: CreatePortfolioPayload) => {},
  onUpdate = async (_payload: UpdatePortfolioPayload) => {},
  onDelete = async (_id: string) => {},
}: {
  data?: PortfolioItem[]
  isLoading?: boolean
  onCreate?: (payload: CreatePortfolioPayload) => Promise<void>
  onUpdate?: (payload: UpdatePortfolioPayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState<(typeof categories)[number]>("Livefeed")
  const [order, setOrder] = useState<number>(0)
  const [file, setFile] = useState<File | undefined>(undefined)
  const [isPublished, setIsPublished] = useState(true)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add Portfolio Item</CardTitle>
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
              <Label htmlFor="p-file">Image</Label>
              <div className="flex items-center gap-3">
                <Input id="p-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
                <Button variant="secondary" type="button">
                  <ImageUp className="h-4 w-4 mr-2" />
                  Upload
                </Button>
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
            <Card key={p._id} className="overflow-hidden">
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
                      src={p.imageUrl || ""}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


