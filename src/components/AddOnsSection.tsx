import { Card } from "@/components/ui/card";

export const AddOnsSection = () => {
  const addOns = [
    { name: "Extra retouched image", price: "RM 20/image" },
    { name: "Transparent / white background", price: "RM 30/image" },
    { name: "Rush delivery (within 48h)", price: "RM 150" },
    { name: "Group photo (posed)", price: "RM 100/photo" },
    { name: "Makeup artist referral", price: "Available upon request" }
  ];

  return (
    <section id="add-ons" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Add-ons & Extras
          </h2>
          <p className="text-xl text-muted-foreground">
            Enhance your headshot experience with these optional services
          </p>
        </div>

        <Card className="p-8 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 text-lg font-semibold text-foreground">Add-on</th>
                  <th className="text-right py-4 text-lg font-semibold text-foreground">Price</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addOn, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-4 text-foreground">{addOn.name}</td>
                    <td className="py-4 text-right font-medium text-foreground">{addOn.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
};