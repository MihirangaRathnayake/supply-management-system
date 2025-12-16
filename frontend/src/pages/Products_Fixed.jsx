import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBoxOpen,
    faBolt,
    faPlus,
    faSync,
    faSearch,
    faTag,
    faDollarSign,
    faArrowTrendUp,
    faGauge,
    faCircleCheck,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    productName: '',
    sku: '',
    description: '',
    unitPrice: '',
    costPrice: '',
    minStockLevel: ''
};

const normalizeProduct = (row = {}) => {
    const id =
        row.PRODUCT_ID ||
        row.product_id ||
        row.productId ||
        row.id ||
        row.SKU ||
        row.sku;

    const unitPrice = Number(row.UNIT_PRICE ?? row.unit_price ?? row.unitPrice ?? 0);
    const costPrice = Number(row.COST_PRICE ?? row.cost_price ?? row.costPrice ?? 0);
    const margin = unitPrice - costPrice;
    const marginPct = unitPrice ? ((unitPrice - costPrice) / unitPrice) * 100 : 0;

    return {
        id,
        sku: row.SKU || row.sku || 'N/A',
        name: row.PRODUCT_NAME || row.product_name || row.productName || 'Unnamed product',
        description: row.DESCRIPTION || row.description || '',
        unitPrice,
        costPrice,
        minStockLevel: Number(row.MIN_STOCK_LEVEL ?? row.min_stock_level ?? row.minStockLevel ?? 0),
        status: row.STATUS || row.status || 'ACTIVE',
        margin,
        marginPct
    };
};

// Separate component to avoid circular reference issues
const StatCard = ({ label, value, iconName, color }) => {
    const iconMap = {
        faBoxOpen,
        faDollarSign,
        faArrowTrendUp,
        faGauge
    };
    
    return (
        <div className={`rounded-xl p-4 shadow-sm ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-semibold">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={iconMap[iconName]} />
                </div>
            </div>
        </div>
    );
};

const Products = () => {
    const { showToast } = useToast();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('table'); // table | cards
    const [sortDir, setSortDir] = useState('desc'); // asc | desc
    const [highlightMargin, setHighlightMargin] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const canManage = ['ADMIN', 'MANAGER'].includes(user?.role);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('/api/products');
            const list = Array.isArray(res.data?.data) ? res.data.data : [];
            setProducts(list.map(normalizeProduct));
        } catch (err) {
            console.error('Failed to load products', err);
            setError(err.response?.data?.message || 'Unable to load products.');
            showToast('Unable to load products', 'error', 4000);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = products.length;
        const av