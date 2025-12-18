import React, { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faWarehouse,
  faExclamationTriangle,
  faMoneyBillWave,
  faShieldAlt,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faMinus,
  faRightLeft,
  faClockRotateLeft,
  faListUl,
  faFilter,
  faDownload,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/ToastContainer';
import {
  useInventoryList,
  useInventorySummary,
  useAdjustStock,
  useReserveStock,
  useReleaseStock,
  useTransferStock,
  useUpdateReorderLevel,
  useInventoryHistory,
  useWarehouses
} from '../api/hooks';

const statusMeta = {
  OK: { label: 'OK', gradient: 'from-emerald-500 to-teal-500', bar: '#34d399' },
  LOW: { label: 'Low', gradient: 'from-amber-400 to-orange-500', bar: '#f59e0b' },
  CRITICAL: { label: 'Critical', gradient: 'from-rose-500 to-red-600', bar: '#ef4444' }
};

const ActionButton = ({ icon, label, colorClass, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white shadow hover:shadow-lg transition ${colorClass}`}
  >
    <FontAwesomeIcon icon={icon} />
    {label}
  </button>
);

const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 relative">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-lg"
        aria-label="Close"
      >
        ×
      </button>
      <h3 className="text-2xl font-bold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const NumberInput = ({ label, value, onChange, min }) => (
  <label className="block mb-4">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-2 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/60"
    />
  </label>
);

const SelectInput = ({ label, value, onChange, options }) => (
  <label className="block mb-4">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/60 bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

const TextAreaInput = ({ label, value, onChange, placeholder }) => (
  <label className="block mb-4">
    <span className="text-sm font-semibold text-slate-600">{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/60 bg-white"
      rows={3}
    />
  </label>
);

const AdjustModal = ({ item, onClose, onSubmit, mode = 'adjust' }) => {
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const labels = {
    adjust: 'Adjust Stock',
    reserve: 'Reserve Stock',
    release: 'Release Stock'
  };
  return (
    <ModalShell title={`${labels[mode]} — ${item?.productName}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 mb-4 text-slate-600">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">SKU</p>
          <p className="font-semibold">{item?.sku}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Warehouse</p>
          <p className="font-semibold">{item?.warehouseName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">On Hand</p>
          <p className="font-semibold">{item?.qtyOnHand}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Reserved</p>
          <p className="font-semibold">{item?.qtyReserved}</p>
        </div>
      </div>
      <NumberInput label="Quantity" value={qty} onChange={setQty} min={mode === 'adjust' ? undefined : 0} />
      <TextAreaInput label="Reason" value={reason} onChange={setReason} placeholder="Reason / reference" />
      {(mode === 'adjust' || mode === 'reserve') && (
        <TextAreaInput label="Note" value={note} onChange={setNote} placeholder="Optional note" />
      )}
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ qty, reason, note })}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
};

const TransferModal = ({ item, warehouses, onClose, onSubmit }) => {
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [qty, setQty] = useState(0);
  const [note, setNote] = useState('');
  return (
    <ModalShell title={`Transfer — ${item?.productName}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-4 mb-4 text-slate-600">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">From</p>
          <p className="font-semibold">{item?.warehouseName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">On hand</p>
          <p className="font-semibold">{item?.qtyOnHand - item?.qtyReserved} available</p>
        </div>
      </div>
      <SelectInput
        label="To Warehouse"
        value={toWarehouseId}
        onChange={setToWarehouseId}
        options={[
          { value: '', label: 'Select destination' },
          ...warehouses
            .filter((w) => w.id !== item?.warehouseId)
            .map((w) => ({ value: w.id, label: `${w.name} (${w.code || w.id})` }))
        ]}
      />
      <NumberInput label="Quantity to transfer" value={qty} onChange={setQty} min={0} />
      <TextAreaInput label="Note" value={note} onChange={setNote} placeholder="Transfer note" />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          onClick={() => onSubmit({ qty, toWarehouseId, note })}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg"
        >
          Transfer
        </button>
      </div>
    </ModalShell>
  );
};

const ReorderModal = ({ item, onClose, onSubmit }) => {
  const [reorder, setReorder] = useState(item?.reorderPoint || 0);
  return (
    <ModalShell title={`Set Reorder — ${item?.productName}`} onClose={onClose}>
      <NumberInput label="Reorder level" value={reorder} onChange={setReorder} min={0} />
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-100">
          Cancel
        </button>
        <button
          onClick={() => onSubmit(reorder)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg"
        >
          Save
        </button>
      </div>
    </ModalShell>
  );
};

const HistoryDrawer = ({ item, onClose }) => {
  const { data, isLoading } = useInventoryHistory(item?.productId, item?.warehouseId);
  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-slate-900/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">History — {item?.productName}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-lg">
            ×
          </button>
        </div>
        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-3">
            {(data || []).map((m) => (
              <div key={m.id} className="border rounded-2xl p-3">
                <div className="flex justify-between text-sm font-semibold text-slate-700">
                  <span>{m.type}</span>
                  <span className="text-slate-500">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Δ {m.qtyChange} | {m.previousQty} → {m.newQty}
                </p>
                {m.reason && <p className="text-xs text-slate-500 mt-1">Reason: {m.reason}</p>}
                {m.note && <p className="text-xs text-slate-500">Note: {m.note}</p>}
              </div>
            ))}
            {!data?.length && <p className="text-slate-500 text-sm">No movement history yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const Inventory = () => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selected, setSelected] = useState({});
  const [activeItem, setActiveItem] = useState(null);
  const [mode, setMode] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: warehousesData } = useWarehouses();
  const warehouses = warehousesData || [];

  const filters = { q: search || undefined, warehouseId: warehouseFilter || undefined, status: statusFilter || undefined, page, limit };
  const { data: listData, isLoading: listLoading } = useInventoryList(filters);
  const { data: summaryData, isLoading: summaryLoading } = useInventorySummary();

  const adjustMutation = useAdjustStock();
  const reserveMutation = useReserveStock();
  const releaseMutation = useReleaseStock();
  const transferMutation = useTransferStock();
  const reorderMutation = useUpdateReorderLevel();

  const rows = listData?.rows || [];
  const total = listData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleSelect = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearSelection = () => setSelected({});

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const selectedRows = useMemo(() => rows.filter((r) => selectedIds.includes(r.inventoryId)), [rows, selectedIds]);

  const exportCsv = () => {
    const header = [
      'SKU',
      'Product',
      'Warehouse',
      'Qty On Hand',
      'Qty Reserved',
      'Qty Available',
      'Reorder',
      'Unit Price',
      'Status'
    ];
    const lines = rows.map((r) =>
      [
        r.sku,
        `"${r.productName}"`,
        `"${r.warehouseName || ''}"`,
        r.qtyOnHand,
        r.qtyReserved,
        r.qtyAvailable,
        r.reorderPoint,
        r.unitPrice,
        r.status
      ].join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const bulkAdjust = async () => {
    if (!selectedRows.length) return showToast('Select rows first', 'error');
    const qtyStr = prompt('Enter quantity change (positive or negative) to apply to selected items:');
    const qtyChange = Number(qtyStr);
    if (Number.isNaN(qtyChange)) return;
    try {
      await Promise.all(
        selectedRows.map((row) =>
          adjustMutation.mutateAsync({
            productId: row.productId,
            warehouseId: row.warehouseId,
            qtyChange,
            reason: 'Bulk adjust'
          })
        )
      );
      showToast('Bulk adjustment applied', 'success');
      clearSelection();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Bulk adjust failed', 'error');
    }
  };

  const openModal = (item, modeName) => {
    setActiveItem(item);
    setMode(modeName);
  };

  const closeModal = () => {
    setActiveItem(null);
    setMode(null);
  };

  const handleAdjust = async ({ qty, reason, note }) => {
    try {
      await adjustMutation.mutateAsync({
        productId: activeItem.productId,
        warehouseId: activeItem.warehouseId,
        qtyChange: qty,
        reason,
        note
      });
      showToast('Stock adjusted', 'success');
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Adjust failed', 'error');
    }
  };

  const handleReserve = async ({ qty, reason, note }) => {
    try {
      await reserveMutation.mutateAsync({
        productId: activeItem.productId,
        warehouseId: activeItem.warehouseId,
        qty,
        referenceType: 'MANUAL',
        referenceId: note,
        reason,
        note
      });
      showToast('Reserved', 'success');
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Reserve failed', 'error');
    }
  };

  const handleRelease = async ({ qty, reason }) => {
    try {
      await releaseMutation.mutateAsync({
        productId: activeItem.productId,
        warehouseId: activeItem.warehouseId,
        qty,
        referenceType: 'MANUAL',
        referenceId: reason
      });
      showToast('Released', 'success');
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Release failed', 'error');
    }
  };

  const handleTransfer = async ({ qty, toWarehouseId, note }) => {
    try {
      await transferMutation.mutateAsync({
        productId: activeItem.productId,
        fromWarehouseId: activeItem.warehouseId,
        toWarehouseId,
        qty,
        note
      });
      showToast('Transfer completed', 'success');
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Transfer failed', 'error');
    }
  };

  const handleReorder = async (reorder) => {
    try {
      await reorderMutation.mutateAsync({
        productId: activeItem.productId,
        warehouseId: activeItem.warehouseId,
        reorderLevel: reorder
      });
      showToast('Reorder level saved', 'success');
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    }
  };

  const renderStatus = (status) => {
    const meta = statusMeta[status] || statusMeta.OK;
    return <StatusBadge status={status} gradient={meta.gradient} label={meta.label} size="sm" />;
  };

  const renderRows = () =>
    rows.map((item) => {
      const meta = statusMeta[item.status] || statusMeta.OK;
      return (
        <tr key={item.inventoryId} className="hover:bg-slate-50/80 border-b last:border-0">
          <td className="px-4 py-3">
            <input type="checkbox" checked={!!selected[item.inventoryId]} onChange={() => toggleSelect(item.inventoryId)} />
          </td>
          <td className="px-4 py-3">
            <div className="font-semibold text-slate-800">{item.productName}</div>
            <div className="text-xs text-slate-500">SKU: {item.sku}</div>
          </td>
          <td className="px-4 py-3 text-slate-700">{item.warehouseName || '-'}</td>
          <td className="px-4 py-3 text-slate-700">{item.qtyOnHand}</td>
          <td className="px-4 py-3 text-slate-700">{item.qtyReserved}</td>
          <td className="px-4 py-3 text-slate-700">{item.reorderPoint}</td>
          <td className="px-4 py-3 text-slate-700">LKR {item.unitPrice.toFixed(2)}</td>
          <td className="px-4 py-3">
            <ProgressBar value={item.qtyOnHand - item.qtyReserved} max={Math.max(item.reorderPoint * 2, 1)} barColor={meta.bar} />
          </td>
          <td className="px-4 py-3">{renderStatus(item.status)}</td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={faPlus} label="Adjust" colorClass="bg-emerald-500" onClick={() => openModal(item, 'adjust')} />
              <ActionButton icon={faShieldAlt} label="Reserve" colorClass="bg-purple-500" onClick={() => openModal(item, 'reserve')} />
              <ActionButton icon={faMinus} label="Release" colorClass="bg-amber-500" onClick={() => openModal(item, 'release')} />
              <ActionButton icon={faRightLeft} label="Transfer" colorClass="bg-blue-500" onClick={() => openModal(item, 'transfer')} />
              <ActionButton icon={faListUl} label="Reorder" colorClass="bg-teal-500" onClick={() => openModal(item, 'reorder')} />
              <ActionButton icon={faClockRotateLeft} label="History" colorClass="bg-slate-500" onClick={() => { setActiveItem(item); setShowHistory(true); }} />
            </div>
          </td>
        </tr>
      );
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Oracle-backed inventory with Mongo audit</p>
          <h1 className="text-3xl font-black text-slate-900">Inventory</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={bulkAdjust}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white font-semibold shadow"
          >
            <FontAwesomeIcon icon={faPlus} /> Bulk adjust
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold border"
          >
            <FontAwesomeIcon icon={faDownload} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard icon={faBoxOpen} label="Total SKUs" value={summaryData?.totalSkus ?? 0} gradient="from-indigo-500 to-purple-500" />
            <StatCard icon={faExclamationTriangle} label="Low Stock" value={summaryData?.lowStock ?? 0} gradient="from-amber-500 to-orange-500" />
            <StatCard icon={faExclamationTriangle} label="Critical" value={summaryData?.critical ?? 0} gradient="from-rose-500 to-red-600" />
            <StatCard icon={faShieldAlt} label="Reserved" value={summaryData?.reserved ?? 0} gradient="from-sky-500 to-blue-600" />
            <StatCard
              icon={faMoneyBillWave}
              label="Stock Value (LKR)"
              value={`LKR ${(summaryData?.stockValue || 0).toLocaleString('en-US')}`}
              gradient="from-emerald-500 to-teal-500"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4 border border-slate-100">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Search SKU, product..."
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-slate-700">
            <FontAwesomeIcon icon={faWarehouse} className="text-slate-500" />
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent outline-none"
            >
              <option value="">All warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code || w.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-slate-700">
            <FontAwesomeIcon icon={faFilter} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent outline-none"
            >
              <option value="">All status</option>
              <option value="OK">OK</option>
              <option value="LOW">Low</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setWarehouseFilter('');
              setStatusFilter('');
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border text-slate-700 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={rows.length > 0 && selectedIds.length === rows.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const all = {};
                        rows.forEach((r) => (all[r.inventoryId] = true));
                        setSelected(all);
                      } else {
                        clearSelection();
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Warehouse</th>
                <th className="px-4 py-3 text-left">On hand</th>
                <th className="px-4 py-3 text-left">Reserved</th>
                <th className="px-4 py-3 text-left">Reorder</th>
                <th className="px-4 py-3 text-left">Unit price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">{listLoading ? null : renderRows()}</tbody>
          </table>
          {listLoading && (
            <div className="p-6">
              <SkeletonCard />
            </div>
          )}
          {!listLoading && !rows.length && <p className="p-6 text-slate-500">No inventory found.</p>}
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t">
          <div className="text-sm text-slate-600">
            Page {page} of {totalPages} • {total} items
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-xl border text-slate-700 flex items-center gap-2"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Prev
            </button>
            <button
              className="px-3 py-2 rounded-xl border text-slate-700 flex items-center gap-2"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      </div>

      {activeItem && mode === 'adjust' && (
        <AdjustModal item={activeItem} onClose={closeModal} onSubmit={handleAdjust} mode="adjust" />
      )}
      {activeItem && mode === 'reserve' && (
        <AdjustModal item={activeItem} onClose={closeModal} onSubmit={handleReserve} mode="reserve" />
      )}
      {activeItem && mode === 'release' && (
        <AdjustModal item={activeItem} onClose={closeModal} onSubmit={handleRelease} mode="release" />
      )}
      {activeItem && mode === 'transfer' && (
        <TransferModal item={activeItem} warehouses={warehouses} onClose={closeModal} onSubmit={handleTransfer} />
      )}
      {activeItem && mode === 'reorder' && (
        <ReorderModal item={activeItem} onClose={closeModal} onSubmit={handleReorder} />
      )}

      {showHistory && activeItem && <HistoryDrawer item={activeItem} onClose={() => { setShowHistory(false); setActiveItem(null); }} />}
    </div>
  );
};

export default Inventory;
