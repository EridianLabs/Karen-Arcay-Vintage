import { ProductForm } from "@/app/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Add product</h1>
      <p className="mt-2 text-zinc-600">
        Add a new listing with title, description, images and category.
      </p>
      <ProductForm />
    </div>
  );
}
