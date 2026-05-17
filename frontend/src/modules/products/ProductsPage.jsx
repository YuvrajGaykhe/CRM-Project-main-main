import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FiBarChart2, FiDownload, FiPlus, FiSave, FiSliders, FiZap } from "react-icons/fi";

import EmptyState from "../../components/ui/EmptyState";
import { ActionButton, Field, Input, Select, Textarea } from "../../components/ui/SigmaForm";
import SigmaModal from "../../components/ui/SigmaModal";
import { createProduct, getProducts, updateProduct } from "../../services/api/crm";

const blankProduct = {
  sku: "",
  name: "",
  category: "amplifier",
  rms_power: "",
  vehicle_fitment: "",
  description: "",
  image_url: "",
  brochure_url: "",
  demand_score: 50,
  is_active: true,
};

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDraft, setProductDraft] = useState(blankProduct);

  const productsQuery = useQuery({
    queryKey: ["products", "phase-two"],
    queryFn: () => getProducts({ page_size: 100 }),
  });

  const products = productsQuery.data?.results || productsQuery.data || [];
  const demandData = useMemo(
    () => products.map((product) => ({ sku: product.sku, demand: product.demand_score, inquiries: product.inquiry_count || 0 })),
    [products]
  );

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setProductDraft(blankProduct);
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: (product) => {
      setSelectedProduct((current) => (current?.id === product.id ? product : current));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const handleCreate = (event) => {
    event.preventDefault();
    createMutation.mutate(productDraft);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Product Performance</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Sigma Amplifier Portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Demand intelligence for BCD202, BCD2401, and BC202 PRO across Indian vehicle segments.
          </p>
        </div>
        <ActionButton onClick={() => setCreateOpen(true)}>
          <FiPlus />
          Add Product
        </ActionButton>
      </div>

      <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Demand vs Inquiry Volume</p>
            <p className="text-xs text-slate-400">Portfolio signal for sales and dealer allocation</p>
          </div>
          <FiBarChart2 className="text-red-300" />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demandData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="sku" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#11131d",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#fff",
                }}
              />
              <Bar dataKey="demand" fill="#ef4444" radius={[8, 8, 0, 0]} />
              <Bar dataKey="inquiries" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {productsQuery.isLoading ? (
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6 text-slate-400">Loading Sigma products...</div>
      ) : products.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5">
              <div className="flex items-start justify-between">
                <button type="button" onClick={() => setSelectedProduct(product)} className="text-left">
                  <p className="text-xs uppercase text-amber-300">{product.sku}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{product.name}</h2>
                </button>
                <div className="rounded-lg bg-red-500/15 p-3 text-red-200">
                  <FiZap />
                </div>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">{product.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-slate-500">RMS Power</p>
                  <p className="mt-1 text-white">{product.rms_power || "Configured soon"}</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="text-slate-500">Demand Score</p>
                  <p className="mt-1 text-white">{product.demand_score}/100</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <FiBarChart2 />
                  {product.inquiry_count || 0} inquiries
                </span>
                <a href={product.brochure_url || "#"} className="inline-flex items-center gap-2 rounded-lg border border-[var(--sigma-border)] px-3 py-2 text-slate-200">
                  <FiDownload />
                  Brochure
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No products configured">Add Sigma products to activate demand analytics and inquiry routing.</EmptyState>
      )}

      <SigmaModal open={createOpen} title="Add Sigma Product" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <Field label="SKU"><Input required value={productDraft.sku} onChange={(event) => setProductDraft({ ...productDraft, sku: event.target.value })} /></Field>
          <Field label="Name"><Input required value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} /></Field>
          <Field label="Category"><Select value={productDraft.category} onChange={(event) => setProductDraft({ ...productDraft, category: event.target.value })}>{["amplifier", "accessory", "bundle"].map((category) => <option key={category} value={category}>{category}</option>)}</Select></Field>
          <Field label="RMS power"><Input value={productDraft.rms_power} onChange={(event) => setProductDraft({ ...productDraft, rms_power: event.target.value })} /></Field>
          <Field label="Vehicle fitment"><Input value={productDraft.vehicle_fitment} onChange={(event) => setProductDraft({ ...productDraft, vehicle_fitment: event.target.value })} /></Field>
          <Field label="Demand score"><Input type="number" min="0" max="100" value={productDraft.demand_score} onChange={(event) => setProductDraft({ ...productDraft, demand_score: Number(event.target.value) })} /></Field>
          <Field label="Brochure URL"><Input value={productDraft.brochure_url} onChange={(event) => setProductDraft({ ...productDraft, brochure_url: event.target.value })} /></Field>
          <Field label="Image URL"><Input value={productDraft.image_url} onChange={(event) => setProductDraft({ ...productDraft, image_url: event.target.value })} /></Field>
          <div className="md:col-span-2"><Field label="Description"><Textarea value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} /></Field></div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <ActionButton tone="secondary" onClick={() => setCreateOpen(false)}>Cancel</ActionButton>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50" disabled={createMutation.isPending}>
              <FiSave />
              Save Product
            </button>
          </div>
        </form>
      </SigmaModal>

      <SigmaModal open={Boolean(selectedProduct)} title={selectedProduct?.name || "Product"} onClose={() => setSelectedProduct(null)}>
        {selectedProduct ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--sigma-border)] bg-white/5 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase text-amber-300">{selectedProduct.sku}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{selectedProduct.name}</p>
                </div>
                <FiSliders className="text-red-300" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{selectedProduct.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Demand score">
                <Input type="number" min="0" max="100" value={selectedProduct.demand_score} onChange={(event) => updateMutation.mutate({ id: selectedProduct.id, payload: { demand_score: Number(event.target.value) } })} />
              </Field>
              <Field label="RMS power">
                <Input value={selectedProduct.rms_power || ""} onChange={(event) => updateMutation.mutate({ id: selectedProduct.id, payload: { rms_power: event.target.value } })} />
              </Field>
              <Field label="Vehicle fitment">
                <Input value={selectedProduct.vehicle_fitment || ""} onChange={(event) => updateMutation.mutate({ id: selectedProduct.id, payload: { vehicle_fitment: event.target.value } })} />
              </Field>
              <Field label="Active">
                <Select value={selectedProduct.is_active ? "true" : "false"} onChange={(event) => updateMutation.mutate({ id: selectedProduct.id, payload: { is_active: event.target.value === "true" } })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </Field>
            </div>
          </div>
        ) : null}
      </SigmaModal>
    </div>
  );
};

export default ProductsPage;
