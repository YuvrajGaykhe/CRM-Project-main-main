import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiMapPin, FiPlus, FiSave, FiSearch, FiShield, FiTrendingUp } from "react-icons/fi";

import EmptyState from "../../components/ui/EmptyState";
import { ActionButton, Field, Input, Select, Textarea } from "../../components/ui/SigmaForm";
import SigmaModal from "../../components/ui/SigmaModal";
import StatusBadge, { pretty } from "../../components/ui/StatusBadge";
import { approveDealer, createDealer, getDealers, getEnterpriseUsers, updateDealer } from "../../services/api/crm";

const blankDealer = {
  name: "",
  business_type: "dealer",
  region: "West",
  state: "",
  city: "",
  pincode: "",
  gst_number: "",
  contact_person: "",
  mobile: "",
  whatsapp: "",
  email: "",
  territory_manager: "",
  tier: "prospect",
  status: "prospect",
  revenue_generated: 0,
  active_leads_count: 0,
  notes: "",
};

const normalize = (payload) =>
  Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, value === "" ? null : value]));

const DealersPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", region: "", status: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerDraft, setDealerDraft] = useState(blankDealer);

  const queryParams = {
    page_size: 100,
    search: filters.search || undefined,
    region: filters.region || undefined,
    status: filters.status || undefined,
  };

  const dealersQuery = useQuery({
    queryKey: ["dealers", queryParams],
    queryFn: () => getDealers(queryParams),
  });
  const usersQuery = useQuery({ queryKey: ["users", "dealer-form"], queryFn: () => getEnterpriseUsers({ page_size: 100 }) });

  const dealersData = dealersQuery.data;
  const usersData = usersQuery.data;
  const dealers = dealersData?.results || dealersData || [];
  const users = usersData?.results || usersData || [];

  const regionStats = useMemo(
    () => {
      const currentDealers = dealersData?.results || dealersData || [];
      return (
      ["North", "West", "South", "East", "Central"].map((region) => ({
        region,
        count: currentDealers.filter((dealer) => dealer.region === region).length,
        revenue: currentDealers
          .filter((dealer) => dealer.region === region)
          .reduce((sum, dealer) => sum + Number(dealer.revenue_generated || 0), 0),
      }))
      );
    },
    [dealersData]
  );

  const createMutation = useMutation({
    mutationFn: (payload) => createDealer(normalize(payload)),
    onSuccess: () => {
      setDealerDraft(blankDealer);
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateDealer(id, payload),
    onSuccess: (dealer) => {
      setSelectedDealer((current) => (current?.id === dealer.id ? dealer : current));
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => approveDealer(id),
    onSuccess: (dealer) => {
      setSelectedDealer(dealer);
      queryClient.invalidateQueries({ queryKey: ["dealers"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-analytics"] });
    },
  });

  const handleCreate = (event) => {
    event.preventDefault();
    createMutation.mutate(dealerDraft);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase text-red-300">Dealer Ecosystem</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Territory Network</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Onboarding, approval, tiering, and regional performance tracking for Sigma Audio partners.
          </p>
        </div>
        <ActionButton onClick={() => setCreateOpen(true)}>
          <FiPlus />
          Add Dealer
        </ActionButton>
      </div>

      <div className="grid gap-3 rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-4 lg:grid-cols-[1fr_180px_180px]">
        <label className="flex items-center gap-3 rounded-lg border border-[var(--sigma-border)] bg-white/5 px-3 py-2 text-sm text-slate-300">
          <FiSearch className="text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            className="w-full bg-transparent outline-none placeholder:text-slate-500"
            placeholder="Search dealer, GST, city, manager"
          />
        </label>
        <Select value={filters.region} onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}>
          <option value="">All regions</option>
          {["North", "West", "South", "East", "Central"].map((region) => <option key={region} value={region}>{region}</option>)}
        </Select>
        <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
          <option value="">All statuses</option>
          {["prospect", "pending_approval", "active", "inactive", "suspended"].map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {regionStats.map((item) => (
          <div key={item.region} className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-4">
            <p className="text-sm text-slate-400">{item.region}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.count}</p>
            <p className="mt-1 text-xs text-slate-500">Rs. {item.revenue.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      {dealersQuery.isLoading ? (
        <div className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-6 text-slate-400">Loading dealer network...</div>
      ) : dealers.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {dealers.map((dealer) => (
            <button
              key={dealer.id}
              type="button"
              onClick={() => setSelectedDealer(dealer)}
              className="rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)]/80 p-5 text-left transition hover:border-red-400/60 hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{dealer.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <FiMapPin />
                    {dealer.city}, {dealer.state}
                  </p>
                </div>
                <StatusBadge value={dealer.status} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Tier</p>
                  <p className="mt-1 capitalize text-white">{dealer.tier}</p>
                </div>
                <div>
                  <p className="text-slate-500">Revenue</p>
                  <p className="mt-1 text-white">Rs. {Number(dealer.revenue_generated || 0).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-slate-500">Leads</p>
                  <p className="mt-1 text-white">{dealer.active_leads_count}</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <FiShield />
                Territory Manager: {dealer.territory_manager_name || "Unassigned"}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="No dealers found">Dealer onboarding records will appear here after approval workflows begin.</EmptyState>
      )}

      <SigmaModal open={createOpen} title="Onboard Dealer" onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <Field label="Dealer name"><Input required value={dealerDraft.name} onChange={(event) => setDealerDraft({ ...dealerDraft, name: event.target.value })} /></Field>
          <Field label="Business type">
            <Select value={dealerDraft.business_type} onChange={(event) => setDealerDraft({ ...dealerDraft, business_type: event.target.value })}>
              {["dealer", "distributor", "retailer", "installer", "fleet_partner"].map((type) => <option key={type} value={type}>{pretty(type)}</option>)}
            </Select>
          </Field>
          <Field label="Region"><Select value={dealerDraft.region} onChange={(event) => setDealerDraft({ ...dealerDraft, region: event.target.value })}>{["North", "West", "South", "East", "Central"].map((region) => <option key={region} value={region}>{region}</option>)}</Select></Field>
          <Field label="State"><Input required value={dealerDraft.state} onChange={(event) => setDealerDraft({ ...dealerDraft, state: event.target.value })} /></Field>
          <Field label="City"><Input required value={dealerDraft.city} onChange={(event) => setDealerDraft({ ...dealerDraft, city: event.target.value })} /></Field>
          <Field label="Pincode"><Input value={dealerDraft.pincode} onChange={(event) => setDealerDraft({ ...dealerDraft, pincode: event.target.value })} /></Field>
          <Field label="GST number"><Input value={dealerDraft.gst_number} onChange={(event) => setDealerDraft({ ...dealerDraft, gst_number: event.target.value })} /></Field>
          <Field label="Contact person"><Input value={dealerDraft.contact_person} onChange={(event) => setDealerDraft({ ...dealerDraft, contact_person: event.target.value })} /></Field>
          <Field label="Mobile"><Input value={dealerDraft.mobile} onChange={(event) => setDealerDraft({ ...dealerDraft, mobile: event.target.value })} /></Field>
          <Field label="WhatsApp"><Input value={dealerDraft.whatsapp} onChange={(event) => setDealerDraft({ ...dealerDraft, whatsapp: event.target.value })} /></Field>
          <Field label="Email"><Input type="email" value={dealerDraft.email} onChange={(event) => setDealerDraft({ ...dealerDraft, email: event.target.value })} /></Field>
          <Field label="Territory manager">
            <Select value={dealerDraft.territory_manager} onChange={(event) => setDealerDraft({ ...dealerDraft, territory_manager: event.target.value })}>
              <option value="">Unassigned</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.username}</option>)}
            </Select>
          </Field>
          <Field label="Tier"><Select value={dealerDraft.tier} onChange={(event) => setDealerDraft({ ...dealerDraft, tier: event.target.value })}>{["prospect", "bronze", "silver", "gold", "platinum"].map((tier) => <option key={tier} value={tier}>{pretty(tier)}</option>)}</Select></Field>
          <Field label="Status"><Select value={dealerDraft.status} onChange={(event) => setDealerDraft({ ...dealerDraft, status: event.target.value })}>{["prospect", "pending_approval", "active", "inactive", "suspended"].map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</Select></Field>
          <div className="md:col-span-2"><Field label="Notes"><Textarea value={dealerDraft.notes} onChange={(event) => setDealerDraft({ ...dealerDraft, notes: event.target.value })} /></Field></div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <ActionButton tone="secondary" onClick={() => setCreateOpen(false)}>Cancel</ActionButton>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50" disabled={createMutation.isPending}>
              <FiSave />
              Save Dealer
            </button>
          </div>
        </form>
      </SigmaModal>

      <SigmaModal open={Boolean(selectedDealer)} title={selectedDealer?.name || "Dealer"} onClose={() => setSelectedDealer(null)} size="max-w-4xl">
        {selectedDealer ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--sigma-border)] bg-white/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-semibold text-white">{selectedDealer.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{selectedDealer.business_type} | {selectedDealer.city}, {selectedDealer.state}</p>
                  </div>
                  <StatusBadge value={selectedDealer.status} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Status">
                    <Select value={selectedDealer.status} onChange={(event) => updateMutation.mutate({ id: selectedDealer.id, payload: { status: event.target.value } })}>
                      {["prospect", "pending_approval", "active", "inactive", "suspended"].map((status) => <option key={status} value={status}>{pretty(status)}</option>)}
                    </Select>
                  </Field>
                  <Field label="Tier">
                    <Select value={selectedDealer.tier} onChange={(event) => updateMutation.mutate({ id: selectedDealer.id, payload: { tier: event.target.value } })}>
                      {["prospect", "bronze", "silver", "gold", "platinum"].map((tier) => <option key={tier} value={tier}>{pretty(tier)}</option>)}
                    </Select>
                  </Field>
                  <Field label="Revenue generated">
                    <Input type="number" value={selectedDealer.revenue_generated} onChange={(event) => updateMutation.mutate({ id: selectedDealer.id, payload: { revenue_generated: event.target.value } })} />
                  </Field>
                  <Field label="Active leads">
                    <Input type="number" value={selectedDealer.active_leads_count} onChange={(event) => updateMutation.mutate({ id: selectedDealer.id, payload: { active_leads_count: Number(event.target.value) } })} />
                  </Field>
                </div>
                {selectedDealer.status !== "active" ? (
                  <div className="mt-4">
                    <ActionButton tone="success" onClick={() => approveMutation.mutate(selectedDealer.id)} disabled={approveMutation.isPending}>
                      <FiCheckCircle />
                      Approve Dealer
                    </ActionButton>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--sigma-border)] bg-white/5 p-4">
              <p className="flex items-center gap-2 font-semibold text-white"><FiTrendingUp /> Territory Snapshot</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">GST</span><span className="text-white">{selectedDealer.gst_number || "Not added"}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Contact</span><span className="text-white">{selectedDealer.contact_person || "Unassigned"}</span></div>
                <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-400">Mobile</span><span className="text-white">{selectedDealer.mobile || "Not added"}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Manager</span><span className="text-white">{selectedDealer.territory_manager_name || "Unassigned"}</span></div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">{selectedDealer.notes || "No dealer notes captured yet."}</p>
            </div>
          </div>
        ) : null}
      </SigmaModal>
    </div>
  );
};

export default DealersPage;
