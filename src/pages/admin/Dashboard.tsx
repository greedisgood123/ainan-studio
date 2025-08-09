import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
  const me = useQuery(api.auth.me, token ? { token } : "skip");
  const logos = useQuery(api.clientLogos.list, {});
  const gallery = useQuery(api.gallery.listAdmin, token ? { token } : "skip");
  const createLogo = useMutation(api.clientLogos.create);
  const updateLogo = useMutation(api.clientLogos.update);
  const removeLogo = useMutation(api.clientLogos.remove);
  const getUploadUrl = useMutation(api.files.getUploadUrl);
  const createGallery = useMutation(api.gallery.create);
  const updateGallery = useMutation(api.gallery.update);
  const removeGallery = useMutation(api.gallery.remove);
  const portfolio = useQuery(api.portfolio.listAdmin, token ? { token } : "skip");
  const createPortfolio = useMutation(api.portfolio.create);
  const updatePortfolio = useMutation(api.portfolio.update);
  const removePortfolio = useMutation(api.portfolio.remove);

  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const [newCategory, setNewCategory] = useState<string>("Livefeed");
  const categories = ["Weddings", "Corporate", "Livefeed"] as const;

  useEffect(() => {
    if (me === null) {
      window.location.hash = "#/admin/login";
    }
  }, [me]);

  if (me === undefined) return null; // loading
  if (me === null) return null; // redirected

  const handleCreate = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    const file = fileInputRef.current.files[0];
    const { uploadUrl } = await getUploadUrl({ token: token! });
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await res.json();
    await createLogo({ token: token!, name: newName || file.name, logoStorageId: storageId, order: Number(newOrder) || 0 });
    setNewName("");
    setNewOrder(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => { localStorage.removeItem("admin_token"); window.location.hash = "#/admin/login"; }}>Log out</Button>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="logos">Client Logos</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="border rounded p-4 space-y-3">
            <h3 className="font-medium">Add Portfolio Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Title" id="p-title" />
              <div>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weddings">Weddings</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Livefeed">Livefeed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Order" id="p-order" type="number" defaultValue={0} />
              <Input placeholder="Description" id="p-desc" className="md:col-span-2" />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" id="p-file" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" id="p-pub" defaultChecked /> Published
              </label>
              <Button onClick={async () => {
                const title = (document.getElementById('p-title') as HTMLInputElement).value;
                const description = (document.getElementById('p-desc') as HTMLInputElement).value;
                const category = newCategory || 'Livefeed';
                const order = Number((document.getElementById('p-order') as HTMLInputElement).value || '0');
                const isPublished = (document.getElementById('p-pub') as HTMLInputElement).checked;
                const file = (document.getElementById('p-file') as HTMLInputElement).files?.[0];
                if (!file) return;
                const { uploadUrl } = await getUploadUrl({ token: token! });
                const res = await fetch(uploadUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
                const { storageId } = await res.json();
                await createPortfolio({ token: token!, title, description, category, imageStorageId: storageId, order, isPublished });
                ['p-title','p-desc','p-category','p-order'].forEach(id => ((document.getElementById(id) as HTMLInputElement).value = ''));
                (document.getElementById('p-pub') as HTMLInputElement).checked = true;
                (document.getElementById('p-file') as HTMLInputElement).value = '';
              }}>Create</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolio?.map(p => (
              <Card key={p._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <Badge>{p.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.imageUrl ? (
                    <div className="rounded overflow-hidden">
                      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                        <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-contain bg-muted" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-28 rounded bg-muted" />
                  )}
                  <Input defaultValue={p.title} onBlur={e => updatePortfolio({ token: token!, id: p._id, title: e.target.value })} />
                  <Input defaultValue={p.description} onBlur={e => updatePortfolio({ token: token!, id: p._id, description: e.target.value })} />
                  <Select defaultValue={p.category} onValueChange={(val) => updatePortfolio({ token: token!, id: p._id, category: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weddings">Weddings</SelectItem>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Livefeed">Livefeed</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2 items-center">
                    <Input className="w-28" defaultValue={p.order} type="number" onBlur={e => updatePortfolio({ token: token!, id: p._id, order: Number(e.target.value) })} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={p.isPublished} onChange={e => updatePortfolio({ token: token!, id: p._id, isPublished: e.target.checked })} />
                      Published
                    </label>
                    <Button variant="destructive" onClick={() => removePortfolio({ token: token!, id: p._id })}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logos" className="space-y-4">
          <div className="border rounded p-4 space-y-3">
            <h3 className="font-medium">Add Logo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label>Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} />
              </div>
              <div className="md:col-span-3">
                <Label>Logo file</Label>
                <Input type="file" accept="image/*" ref={fileInputRef} />
              </div>
            </div>
            <Button onClick={handleCreate}>Create</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {logos?.map(l => (
              <Card key={l._id}>
                <CardHeader>
                  <CardTitle className="text-base">{l.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img src={`/_storage/${l.logoStorageId}`} alt={l.name} className="w-full h-24 object-contain bg-muted" />
                  <div className="flex gap-2 items-center">
                    <Input defaultValue={l.name} onBlur={e => updateLogo({ token: token!, id: l._id, name: e.target.value })} />
                    <Input type="number" className="w-24" defaultValue={l.order} onBlur={e => updateLogo({ token: token!, id: l._id, order: Number(e.target.value) })} />
                    <Button variant="destructive" onClick={() => removeLogo({ token: token!, id: l._id })}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <div className="border rounded p-4 space-y-3">
            <h3 className="font-medium">Add Gallery Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Title" id="g-title" />
              <Input placeholder="Badge (e.g., Livefeed)" id="g-badge" />
              <Input placeholder="Icon (Play|Camera|Zap)" id="g-icon" />
              <Input placeholder="Order" id="g-order" type="number" defaultValue={0} />
              <Input placeholder="Description" id="g-desc" className="md:col-span-2" />
            </div>
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <Input type="file" accept="image/*" ref={galleryFileInputRef} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" id="g-pub" defaultChecked /> Published
              </label>
              <Button onClick={() => {
                const title = (document.getElementById('g-title') as HTMLInputElement).value;
                const description = (document.getElementById('g-desc') as HTMLInputElement).value;
                const badge = (document.getElementById('g-badge') as HTMLInputElement).value || 'Badge';
                const iconName = (document.getElementById('g-icon') as HTMLInputElement).value || 'Play';
                const order = Number((document.getElementById('g-order') as HTMLInputElement).value || '0');
                const isPublished = (document.getElementById('g-pub') as HTMLInputElement).checked;
                const doCreate = async () => {
                  let imageStorageId: any = undefined;
                  const file = galleryFileInputRef.current?.files?.[0];
                  if (file) {
                    const { uploadUrl } = await getUploadUrl({ token: token! });
                    const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
                    const json = await res.json();
                    imageStorageId = json.storageId;
                  }
                  await createGallery({ token: token!, title, description, badge, iconName, order, isPublished, imageStorageId });
                };
                doCreate();
                ['g-title','g-desc','g-badge','g-icon','g-order'].forEach(id => ((document.getElementById(id) as HTMLInputElement).value = ''));
                (document.getElementById('g-pub') as HTMLInputElement).checked = true;
                if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
              }}>Create</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gallery?.map(item => (
              <Card key={item._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge>{item.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.imageStorageId && (
                    <img src={`/_storage/${item.imageStorageId}`} alt={item.title} className="w-full h-24 object-cover rounded" />
                  )}
                  <Input defaultValue={item.title} onBlur={e => updateGallery({ token: token!, id: item._id, title: e.target.value })} />
                  <Input defaultValue={item.description} onBlur={e => updateGallery({ token: token!, id: item._id, description: e.target.value })} />
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const { uploadUrl } = await getUploadUrl({ token: token! });
                      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
                      const { storageId } = await res.json();
                      await updateGallery({ token: token!, id: item._id, imageStorageId: storageId });
                    }} />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input className="w-28" defaultValue={item.order} type="number" onBlur={e => updateGallery({ token: token!, id: item._id, order: Number(e.target.value) })} />
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked={item.isPublished} onChange={e => updateGallery({ token: token!, id: item._id, isPublished: e.target.checked })} />
                      Published
                    </label>
                    <Button variant="destructive" onClick={() => removeGallery({ token: token!, id: item._id })}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;


