"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export type PackageItem = {
  _id: string
  title: string
  price: string
  description: string
  features: string[]
  addOns: { name: string; price: string }[]
  isPopular: boolean
  badge?: string
  order: number
  isPublished: boolean
}

export type CreatePackagePayload = Omit<PackageItem, "_id"> & {}
export type UpdatePackagePayload = Partial<Omit<PackageItem, "_id">> & { id: string }

export function PackagesSection({
  data = [],
  isLoading = false,
  onCreate = async (_payload: CreatePackagePayload) => {},
  onUpdate = async (_payload: UpdatePackagePayload) => {},
  onDelete = async (_id: string) => {},
}: {
  data?: PackageItem[]
  isLoading?: boolean
  onCreate?: (payload: CreatePackagePayload) => Promise<void>
  onUpdate?: (payload: UpdatePackagePayload) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}) {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [featuresText, setFeaturesText] = useState("")
  const [addOnsText, setAddOnsText] = useState("")
  const [isPopular, setIsPopular] = useState(false)
  const [badge, setBadge] = useState("")
  const [order, setOrder] = useState<number>(0)
  const [isPublished, setIsPublished] = useState(true)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Add Package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pk-title">Title</Label>
              <Input id="pk-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-price">Price</Label>
              <Input id="pk-price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="pk-desc">Description</Label>
              <Input id="pk-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Add-ons (format: name | price, one per line)</Label>
              <Textarea value={addOnsText} onChange={(e) => setAddOnsText(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-order">Order</Label>
              <Input id="pk-order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-badge">Badge (optional)</Label>
              <Input id="pk-badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="pk-pop" checked={isPopular} onCheckedChange={setIsPopular} />
              <Label htmlFor="pk-pop" className="cursor-pointer">Most Popular</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="pk-pub" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="pk-pub" className="cursor-pointer">Published</Label>
            </div>
          </div>
          <Button
            onClick={async () => {
              if (!title || !price) return
              const features = featuresText
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
              const addOns = addOnsText
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
                .map(line => {
                  const [name, price] = line.split('|').map(x => x.trim())
                  return { name, price: price ?? '' }
                })
              await onCreate({ title, price, description, features, addOns, isPopular, badge: badge || undefined, order, isPublished })
              setTitle("")
              setPrice("")
              setDescription("")
              setFeaturesText("")
              setAddOnsText("")
              setIsPopular(false)
              setBadge("")
              setOrder(0)
              setIsPublished(true)
            }}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground">No packages yet. Add your first package above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((p) => (
            <Card key={p._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  {p.isPublished && p.isPopular && (
                    <Badge variant="secondary">Most Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input defaultValue={p.title} onBlur={(e) => onUpdate({ id: p._id, title: e.target.value })} />
                <Input defaultValue={p.price} onBlur={(e) => onUpdate({ id: p._id, price: e.target.value })} />
                <Input defaultValue={p.description} onBlur={(e) => onUpdate({ id: p._id, description: e.target.value })} />
                <Input
                  defaultValue={p.order}
                  type="number"
                  onBlur={(e) => onUpdate({ id: p._id, order: Number(e.target.value) })}
                  className="w-28"
                />
                <div className="flex items-center gap-2">
                  <Switch id={`pop-${p._id}`} checked={p.isPopular} onCheckedChange={checked => onUpdate({ id: p._id, isPopular: checked })} />
                  <Label htmlFor={`pop-${p._id}`} className="cursor-pointer text-sm">Most Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id={`pub-${p._id}`} checked={p.isPublished} onCheckedChange={checked => onUpdate({ id: p._id, isPublished: checked })} />
                  <Label htmlFor={`pub-${p._id}`} className="cursor-pointer text-sm">Published</Label>
                </div>
                <Button variant="destructive" size="sm" onClick={() => onDelete(p._id)}>Delete</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


