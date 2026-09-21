/// <reference path="../declarations.d.ts" />
'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Info,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Minus,
  MoreHorizontal,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  User,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  authApi,
  dashboardApi,
  invoiceApi,
  customerApi,
  productApi,
  companyApi,
  getToken,
  setToken,
  removeToken,
} from '@/lib/api'

// Multi-currency formatter helper
function formatCurrency(amount: number | string = 0, currency = 'TND'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount
  const decimals = ['TND', 'KWD', 'BHD', 'OMR', 'JOD'].includes(currency) ? 3 : 2
  return `${num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${currency}`
}

const WORLD_COUNTRIES = [
  { code: 'USA', name: 'USA (America)', flag: '🇺🇸' },
  { code: 'Japan', name: 'Japan', flag: '🇯🇵' },
  { code: 'Germany', name: 'Germany', flag: '🇩🇪' },
  { code: 'France', name: 'France', flag: '🇫🇷' },
  { code: 'Tunisia', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'China', name: 'China', flag: '🇨🇳' },
  { code: 'Afghanistan', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'Albania', name: 'Albania', flag: '🇦🇱' },
  { code: 'Algeria', name: 'Algeria', flag: '🇩🇿' },
  { code: 'Andorra', name: 'Andorra', flag: '🇦🇩' },
  { code: 'Angola', name: 'Angola', flag: '🇦🇴' },
  { code: 'Argentina', name: 'Argentina', flag: '🇦🇷' },
  { code: 'Armenia', name: 'Armenia', flag: '🇦🇲' },
  { code: 'Australia', name: 'Australia', flag: '🇦🇺' },
  { code: 'Austria', name: 'Austria', flag: '🇦🇹' },
  { code: 'Azerbaijan', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'Bahrain', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'Bangladesh', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'Belarus', name: 'Belarus', flag: '🇧🇾' },
  { code: 'Belgium', name: 'Belgium', flag: '🇧🇪' },
  { code: 'Bolivia', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'Bosnia', name: 'Bosnia & Herzegovina', flag: '🇧🇦' },
  { code: 'Brazil', name: 'Brazil', flag: '🇧🇷' },
  { code: 'Bulgaria', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'Canada', name: 'Canada', flag: '🇨🇦' },
  { code: 'Chile', name: 'Chile', flag: '🇨🇱' },
  { code: 'Colombia', name: 'Colombia', flag: '🇨🇴' },
  { code: 'Costa Rica', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'Croatia', name: 'Croatia', flag: '🇭🇷' },
  { code: 'Cyprus', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'Czech Republic', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'Denmark', name: 'Denmark', flag: '🇩🇰' },
  { code: 'Egypt', name: 'Egypt', flag: '🇪🇬' },
  { code: 'Estonia', name: 'Estonia', flag: '🇪🇪' },
  { code: 'Finland', name: 'Finland', flag: '🇫🇮' },
  { code: 'Georgia', name: 'Georgia', flag: '🇬🇪' },
  { code: 'Ghana', name: 'Ghana', flag: '🇬🇭' },
  { code: 'Greece', name: 'Greece', flag: '🇬🇷' },
  { code: 'Hong Kong', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'Hungary', name: 'Hungary', flag: '🇭🇺' },
  { code: 'Iceland', name: 'Iceland', flag: '🇮🇸' },
  { code: 'India', name: 'India', flag: '🇮🇳' },
  { code: 'Indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'Iran', name: 'Iran', flag: '🇮🇷' },
  { code: 'Iraq', name: 'Iraq', flag: '🇮🇶' },
  { code: 'Ireland', name: 'Ireland', flag: '🇮🇪' },
  { code: 'Israel', name: 'Israel', flag: '🇮🇱' },
  { code: 'Italy', name: 'Italy', flag: '🇮🇹' },
  { code: 'Jordan', name: 'Jordan', flag: '🇯🇴' },
  { code: 'Kazakhstan', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'Kenya', name: 'Kenya', flag: '🇰🇪' },
  { code: 'Kuwait', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'Lebanon', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'Libya', name: 'Libya', flag: '🇱🇾' },
  { code: 'Luxembourg', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'Malaysia', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'Malta', name: 'Malta', flag: '🇲🇹' },
  { code: 'Mexico', name: 'Mexico', flag: '🇲🇽' },
  { code: 'Monaco', name: 'Monaco', flag: '🇲🇨' },
  { code: 'Morocco', name: 'Morocco', flag: '🇲🇦' },
  { code: 'Netherlands', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'New Zealand', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'Nigeria', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'Norway', name: 'Norway', flag: '🇳🇴' },
  { code: 'Oman', name: 'Oman', flag: '🇴🇲' },
  { code: 'Pakistan', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'Palestine', name: 'Palestine', flag: '🇵🇸' },
  { code: 'Peru', name: 'Peru', flag: '🇵🇪' },
  { code: 'Philippines', name: 'Philippines', flag: '🇵🇭' },
  { code: 'Poland', name: 'Poland', flag: '🇵🇱' },
  { code: 'Portugal', name: 'Portugal', flag: '🇵🇹' },
  { code: 'Qatar', name: 'Qatar', flag: '🇶🇦' },
  { code: 'Romania', name: 'Romania', flag: '🇷🇴' },
  { code: 'Russia', name: 'Russia', flag: '🇷🇺' },
  { code: 'Saudi Arabia', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'Senegal', name: 'Senegal', flag: '🇸🇳' },
  { code: 'Serbia', name: 'Serbia', flag: '🇷🇸' },
  { code: 'Singapore', name: 'Singapore', flag: '🇸🇬' },
  { code: 'Slovakia', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'Slovenia', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'South Africa', name: 'South Africa', flag: '🇿🇦' },
  { code: 'South Korea', name: 'South Korea', flag: '🇰🇷' },
  { code: 'Spain', name: 'Spain', flag: '🇪🇸' },
  { code: 'Sweden', name: 'Sweden', flag: '🇸🇪' },
  { code: 'Switzerland', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'Taiwan', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'Thailand', name: 'Thailand', flag: '🇹🇭' },
  { code: 'Turkey', name: 'Turkey', flag: '🇹🇷' },
  { code: 'Ukraine', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'UAE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'Uruguay', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'Uzbekistan', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'Vietnam', name: 'Vietnam', flag: '🇻🇳' },
]

function getCountryDisplay(codeOrName: string) {
  if (!codeOrName) return '🇺🇸 USA (America)'
  const match = WORLD_COUNTRIES.find(
    (c) => c.code.toLowerCase() === codeOrName.toLowerCase() || c.name.toLowerCase().includes(codeOrName.toLowerCase())
  )
  if (match) return `${match.flag} ${match.name}`
  return `🌐 ${codeOrName}`
}

function CountrySelectPopover({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCountries = WORLD_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCountry = WORLD_COUNTRIES.find(
    (c) => c.code.toLowerCase() === (value || '').toLowerCase()
  ) || { code: value || 'USA', name: value || 'USA (America)', flag: '🇺🇸' }

  return (
    <div ref={containerRef} className="relative mt-1 w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 shadow-xs hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <span className="truncate">
          {selectedCountry.flag} {selectedCountry.name}
        </span>
        <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search country..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code)
                  setIsOpen(false)
                  setSearch('')
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors text-left ${
                  (value || '').toLowerCase() === c.code.toLowerCase()
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                {(value || '').toLowerCase() === c.code.toLowerCase() && (
                  <span className="text-xs font-bold text-indigo-600">✓</span>
                )}
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="p-3 text-center text-xs text-slate-400">No country found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CustomerSelectPopover({
  customers,
  value,
  onChange,
  onAddNewCustomer,
}: {
  customers: any[]
  value: string
  onChange: (customerId: string) => void
  onAddNewCustomer: (initialName?: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const selectedCust = customers.find((c) => c._id === value)

  // Keep input text synced with selected customer or user typing
  useEffect(() => {
    if (selectedCust) {
      setQuery(selectedCust.name)
    } else if (!value) {
      setQuery('')
    }
  }, [value, selectedCust])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (selectedCust) {
          setQuery(selectedCust.name)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedCust])

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  })

  const hasExactMatch = customers.some(
    (c) => (c.name || '').toLowerCase().trim() === query.toLowerCase().trim()
  )

  return (
    <div ref={containerRef} className="relative mt-1 w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Type customer name to search or create..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
            if (!e.target.value.trim() && value) {
              onChange('')
            }
          }}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-800 shadow-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 max-h-48 overflow-y-auto space-y-1">
          {query.trim() !== '' && !hasExactMatch && (
            <button
              type="button"
              onClick={() => {
                onAddNewCustomer(query.trim())
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Plus className="size-4 shrink-0 text-indigo-600" />
              <span className="truncate">Add &quot;<span className="underline">{query.trim()}</span>&quot; as New Customer</span>
            </button>
          )}

          {filtered.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => {
                onChange(c._id)
                setQuery(c.name)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs transition-colors text-left ${
                value === c._id
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <div className="font-semibold text-slate-800">{c.name}</div>
                {c.companyName && <div className="text-[11px] text-slate-400">{c.companyName}</div>}
              </div>
              {value === c._id && <span className="text-xs font-bold text-indigo-600">✓</span>}
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500 mb-2">No customer matches &quot;{query}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  onAddNewCustomer(query.trim())
                  setIsOpen(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="size-4" /> Create &quot;{query.trim()}&quot; Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductSelectPopover({
  products,
  value,
  onChange,
  onAddNewProduct,
  currency,
}: {
  products: any[]
  value: string
  onChange: (productId: string, price?: number) => void
  onAddNewProduct: (initialName?: string) => void
  currency?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  const selectedProd = products.find((p) => p._id === value)

  useEffect(() => {
    if (selectedProd) {
      setQuery(selectedProd.reference ? `[${selectedProd.reference}] ${selectedProd.name}` : selectedProd.name)
    } else if (!value) {
      setQuery('')
    }
  }, [value, selectedProd])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        if (selectedProd) {
          setQuery(selectedProd.reference ? `[${selectedProd.reference}] ${selectedProd.name}` : selectedProd.name)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedProd])

  const filtered = products.filter((p) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.reference || '').toLowerCase().includes(q)
    )
  })

  const hasExactMatch = products.some(
    (p) => (p.name || '').toLowerCase().trim() === query.toLowerCase().trim()
  )

  return (
    <div ref={containerRef} className="relative w-full min-w-0 flex-1">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Choose product or type to search/create..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
            if (!e.target.value.trim() && value) {
              onChange('', 0)
            }
          }}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-slate-800 shadow-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <ChevronDown className={`size-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 max-h-48 overflow-y-auto space-y-1">
          {query.trim() !== '' && !hasExactMatch && (
            <button
              type="button"
              onClick={() => {
                onAddNewProduct(query.trim())
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
              <Plus className="size-3.5 shrink-0 text-indigo-600" />
              <span className="truncate">Add &quot;<span className="underline">{query.trim()}</span>&quot; as New Product</span>
            </button>
          )}

          {filtered.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                onChange(p._id, p.sellingPrice)
                setQuery(p.reference ? `[${p.reference}] ${p.name}` : p.name)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors text-left ${
                value === p._id
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  {p.reference ? <span className="font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-[10px] font-bold">[{p.reference}]</span> : null}
                  <span>{p.name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {formatCurrency(p.sellingPrice, currency)} • Stock: {p.stockQuantity}
                </div>
              </div>
              {value === p._id && <span className="text-xs font-bold text-indigo-600">✓</span>}
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-3 text-center">
              <p className="text-xs text-slate-500 mb-1.5">No product matches &quot;{query}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  onAddNewProduct(query.trim())
                  setIsOpen(false)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                <Plus className="size-3.5" /> Create &quot;{query.trim()}&quot; Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, type = 'status' }: { status: string; type?: 'status' | 'payment' }) {
  const s = (status || '').toLowerCase()
  let classes = 'bg-slate-100 text-slate-600 ring-slate-200'

  if (s === 'paid' || s === 'finalized') {
    classes = 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  } else if (s === 'partially_paid' || s === 'pending') {
    classes = 'bg-amber-50 text-amber-700 ring-amber-200'
  } else if (s === 'overdue' || s === 'cancelled') {
    classes = 'bg-rose-50 text-rose-700 ring-rose-200'
  } else if (s === 'draft' || s === 'unpaid') {
    classes = 'bg-slate-100 text-slate-600 ring-slate-200'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status ? status.replace('_', ' ').toUpperCase() : 'N/A'}
    </span>
  )
}

export default function InvoicingApp() {
  const [user, setUser] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [active, setActive] = useState('Invoices')
  const [mobileNav, setMobileNav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('demo@enterprise.tn')
  const [authPassword, setAuthPassword] = useState('password123')
  const [authName, setAuthName] = useState('Demo User')
  const [authCompanyName, setAuthCompanyName] = useState('Demo Business SARL')
  const [authError, setAuthError] = useState('')

  // Workspace Data
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [reports, setReports] = useState<any>(null)
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false)

  // Professional Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }, [])

  // Notification Center State
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; time: string; type: string; read: boolean }>>([
    {
      id: 'n1',
      title: 'Invoice Payment Due',
      message: 'Invoice INV-2026-000001 has 11,925 TND payment pending',
      time: '10m ago',
      type: 'invoice',
      read: false,
    },
    {
      id: 'n2',
      title: 'New Customer Registered',
      message: 'dfg Customer was added to directory',
      time: '1h ago',
      type: 'user',
      read: false,
    },
    {
      id: 'n3',
      title: 'Invoix PWA Active',
      message: 'Service worker ready for offline use & 1-tap desktop access',
      time: '2h ago',
      type: 'system',
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    showToast('All notifications marked as read', 'info')
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW reg error:', err))
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallAppClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast('App installed on device successfully!')
      }
      setDeferredPrompt(null)
    }
    setShowInstallBanner(false)
  }

  // Modals & Action States
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null)
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeLineItemIdx, setActiveLineItemIdx] = useState<number | null>(null)

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [invoiceDueDate, setInvoiceDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [invoiceTerms, setInvoiceTerms] = useState('30 days')
  const [applyVat, setApplyVat] = useState(true)
  const [invoiceItems, setInvoiceItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number; discount: number }>>([
    { productId: '', quantity: 1, unitPrice: 0, discount: 0 }
  ])

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('')
  const [newCustCompany, setNewCustCompany] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [newCustTaxId, setNewCustTaxId] = useState('')

  // New Product Form State
  const [newProdName, setNewProdName] = useState('')
  const [newProdRef, setNewProdRef] = useState('')
  const [newProdOrigin, setNewProdOrigin] = useState('USA')
  const [newProdPrice, setNewProdPrice] = useState('10.000')
  const [newProdStock, setNewProdStock] = useState('20')
  const [newProdVat, setNewProdVat] = useState('19')

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [paymentRef, setPaymentRef] = useState('')

  // Company Profile Form State
  const [compName, setCompName] = useState('')
  const [compTaxId, setCompTaxId] = useState('')
  const [compEmail, setCompEmail] = useState('')
  const [compPhone, setCompPhone] = useState('')
  const [compAddress, setCompAddress] = useState('')
  const [compCity, setCompCity] = useState('')
  const [compCurrency, setCompCurrency] = useState('TND')
  const [compVatRate, setCompVatRate] = useState('19')
  const [compPrefix, setCompPrefix] = useState('INV')

  useEffect(() => {
    if (company) {
      setCompName(company.name || '')
      setCompTaxId(company.taxId || '')
      setCompEmail(company.email || '')
      setCompPhone(company.phone || '')
      setCompAddress(company.address || '')
      setCompCity(company.city || '')
      setCompCurrency(company.defaultCurrency || 'TND')
      setCompVatRate(company.defaultVatRate ? company.defaultVatRate.toString() : '19')
      setCompPrefix(company.invoicePrefix || 'INV')
    }
  }, [company])

  // Check current session
  const checkAuth = useCallback(async () => {
    try {
      const token = getToken()
      if (!token) {
        setLoading(false)
        setShowAuthModal(true)
        return
      }
      const res = await authApi.getMe()
      if (res.success && res.data) {
        setUser(res.data.user)
        setCompany(res.data.company)
        setShowAuthModal(false)
        loadWorkspaceData()
      } else {
        setShowAuthModal(true)
      }
    } catch (err) {
      removeToken()
      setShowAuthModal(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const loadWorkspaceData = async () => {
    setLoading(true)
    try {
      const [dashRes, invRes, custRes, prodRes, repRes] = await Promise.all([
        dashboardApi.getSummary().catch(() => null),
        invoiceApi.getAll().catch(() => null),
        customerApi.getAll().catch(() => null),
        productApi.getAll().catch(() => null),
        dashboardApi.getSalesReport().catch(() => null),
      ])

      if (dashRes?.data) setDashboardData(dashRes.data)
      if (invRes?.data) setInvoices(invRes.data)
      if (custRes?.data) setCustomers(custRes.data)
      if (prodRes?.data) setProducts(prodRes.data)
      if (repRes?.data) setReports(repRes.data)
    } catch (e) {
      console.error('Failed to load workspace data', e)
    } finally {
      setLoading(false)
    }
  }

  // Handle Login / Register
  const handleAuth = async (e: any) => {
    e.preventDefault()
    setAuthError('')
    setIsSubmitting(true)
    try {
      let res
      if (authMode === 'register') {
        res = await authApi.register({
          companyName: authCompanyName,
          name: authName,
          email: authEmail,
          password: authPassword,
        })
      } else {
        res = await authApi.login({
          email: authEmail,
          password: authPassword,
        })
      }

      if (res.data?.token) {
        setToken(res.data.token)
        setUser(res.data.user)
        setCompany(res.data.company)
        setShowAuthModal(false)
        loadWorkspaceData()
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
    setCompany(null)
    setShowAuthModal(true)
  }

  // Create / Update Invoice Handler (with option to Finalize directly)
  const handleCreateInvoice = async (shouldFinalize: boolean = false) => {
    if (!selectedCustomerId) {
      showToast('Please select a customer', 'error')
      return
    }
    const validItems = invoiceItems.filter((i: { productId: string; quantity: number }) => i.productId && i.quantity > 0)
    if (validItems.length === 0) {
      showToast('Please add at least one product with quantity', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        customerId: selectedCustomerId,
        dueDate: invoiceDueDate,
        applyVat,
        paymentTerms: invoiceTerms,
        items: validItems,
      }

      let res
      if (editingInvoiceId) {
        res = await invoiceApi.update(editingInvoiceId, payload)
      } else {
        res = await invoiceApi.create(payload)
      }

      const invId = res.data?._id || editingInvoiceId

      if (shouldFinalize && invId) {
        await invoiceApi.finalize(invId)
      }

      setShowNewInvoiceModal(false)
      setEditingInvoiceId(null)
      showToast(shouldFinalize ? 'Invoice finalized & created successfully!' : 'Invoice draft saved successfully!')
      loadWorkspaceData()
      setActive('Invoices')
    } catch (err: any) {
      showToast(err.message || 'Error saving invoice', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Finalize Invoice Handler
  const handleFinalizeInvoice = async (invoiceId: string) => {
    if (!confirm('Finalizing an invoice assigns an official invoice number (e.g. INV-2026-0001), updates inventory stock, and locks the invoice. Continue?')) return
    try {
      await invoiceApi.finalize(invoiceId)
      showToast('Invoice finalized successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize invoice', 'error')
    }
  }

  // Edit Invoice Handler (opens modal with populated data)
  const handleEditInvoice = (inv: any) => {
    setEditingInvoiceId(inv._id)
    setSelectedCustomerId(inv.customerId?._id || inv.customerId || '')
    setInvoiceDueDate(inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '')
    setInvoiceTerms(inv.paymentTerms || '30 days')
    setApplyVat(inv.applyVat !== false)
    if (inv.items && inv.items.length > 0) {
      setInvoiceItems(
        inv.items.map((it: any) => ({
          productId: it.productId?._id || it.productId || '',
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0,
          discount: it.discount || 0,
        }))
      )
    }
    setShowNewInvoiceModal(true)
  }

  // Delete Invoice Handler
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this draft invoice?')) return
    try {
      await invoiceApi.delete(invoiceId)
      showToast('Invoice deleted successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete invoice', 'error')
    }
  }

  // Download PDF Handler
  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const url = await invoiceApi.getPdfBlobUrl(invoiceId)
      window.open(url, '_blank')
    } catch (err: any) {
      showToast(err.message || 'Failed to generate PDF', 'error')
    }
  }

  // Record Payment Handler
  const handleRecordPayment = async () => {
    if (!showPaymentModal || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      showToast('Please enter a valid payment amount', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await invoiceApi.recordPayment(showPaymentModal._id, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        reference: paymentRef,
      })
      setShowPaymentModal(null)
      setPaymentAmount('')
      setPaymentRef('')
      showToast('Payment recorded successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save Company Profile Settings
  const handleSaveCompanySettings = async (e: any) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await companyApi.update({
        name: compName,
        taxId: compTaxId,
        email: compEmail,
        phone: compPhone,
        address: compAddress,
        city: compCity,
        defaultCurrency: compCurrency,
        defaultVatRate: parseFloat(compVatRate) || 19,
        invoicePrefix: compPrefix,
      })
      if (res.data) {
        setCompany(res.data)
        showToast('Company Billing Profile updated successfully!')
        loadWorkspaceData()
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update company profile', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Customer Edit & Delete Handlers
  const handleEditCustomer = (cust: any) => {
    setEditingCustomerId(cust._id)
    setNewCustName(cust.name || '')
    setNewCustCompany(cust.companyName || '')
    setNewCustEmail(cust.email || '')
    setNewCustPhone(cust.phone || '')
    setNewCustTaxId(cust.taxId || '')
    setShowNewCustomerModal(true)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await customerApi.delete(id)
      showToast('Customer deleted successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error')
    }
  }

  // Create / Update Customer Handler
  const handleAddCustomer = async (e: any) => {
    e.preventDefault()
    if (!newCustName) return
    setIsSubmitting(true)
    try {
      const payload = {
        name: newCustName,
        companyName: newCustCompany,
        email: newCustEmail,
        phone: newCustPhone,
        taxId: newCustTaxId,
      }
      let savedCust: any = null
      if (editingCustomerId) {
        const res = await customerApi.update(editingCustomerId, payload)
        savedCust = res?.data
      } else {
        const res = await customerApi.create(payload)
        savedCust = res?.data
      }
      setShowNewCustomerModal(false)
      setEditingCustomerId(null)
      setNewCustName('')
      setNewCustCompany('')
      setNewCustEmail('')
      setNewCustPhone('')
      setNewCustTaxId('')
      if (savedCust && savedCust._id) {
        setSelectedCustomerId(savedCust._id)
      }
      showToast(editingCustomerId ? 'Customer updated successfully!' : 'New customer added successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to save customer', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Product Edit & Delete Handlers
  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod._id)
    setNewProdName(prod.name || '')
    setNewProdRef(prod.reference || '')
    setNewProdOrigin(prod.originCountry || 'USA')
    setNewProdPrice(prod.sellingPrice ? prod.sellingPrice.toString() : '0')
    setNewProdStock(prod.stockQuantity ? prod.stockQuantity.toString() : '0')
    setNewProdVat(prod.vatRate ? prod.vatRate.toString() : '19')
    setShowNewProductModal(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productApi.delete(id)
      showToast('Product deleted successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product', 'error')
    }
  }

  // Create / Update Product Handler
  const handleAddProduct = async (e: any) => {
    e.preventDefault()
    if (!newProdName) return
    setIsSubmitting(true)
    try {
      const payload = {
        name: newProdName,
        reference: newProdRef,
        originCountry: newProdOrigin,
        sellingPrice: parseFloat(newProdPrice) || 0,
        stockQuantity: parseFloat(newProdStock) || 0,
        vatRate: parseFloat(newProdVat) || 19,
      }
      let savedProd: any = null
      if (editingProductId) {
        const res = await productApi.update(editingProductId, payload)
        savedProd = res?.data
      } else {
        const res = await productApi.create(payload)
        savedProd = res?.data
      }
      setShowNewProductModal(false)
      setEditingProductId(null)
      setNewProdName('')
      setNewProdRef('')
      setNewProdOrigin('USA')
      setNewProdPrice('10.000')
      setNewProdStock('20')
      if (savedProd && savedProd._id && activeLineItemIdx !== null) {
        const copy = [...invoiceItems]
        if (copy[activeLineItemIdx]) {
          copy[activeLineItemIdx].productId = savedProd._id
          copy[activeLineItemIdx].unitPrice = savedProd.sellingPrice || parseFloat(newProdPrice) || 0
          setInvoiceItems(copy)
        }
        setActiveLineItemIdx(null)
      }
      showToast(editingProductId ? 'Product updated successfully!' : 'New product added successfully!')
      loadWorkspaceData()
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { label: 'Overview', icon: LayoutDashboard },
        { label: 'Invoices', icon: FileText, count: invoices.length },
        { label: 'Customers', icon: Users, count: customers.length },
        { label: 'Products', icon: Package, count: products.length },
      ],
    },
    {
      label: 'Insights',
      items: [
        { label: 'Reports', icon: Boxes },
        { label: 'Settings', icon: Settings },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          mobileNav ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <img src="/app-logo.png" alt="Logo" className="size-10 rounded-xl object-contain shadow-xs" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">Invoix</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">Billing Platform</span>
          </div>
          <button onClick={() => setMobileNav(false)} className="ml-auto rounded-md p-1 text-slate-400 lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 px-3 py-6">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</p>
              <nav className="flex flex-col gap-1">
                {group.items.map(({ label, icon: Icon, count }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActive(label)
                      setMobileNav(false)
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active === label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    {label}
                    {count !== undefined && count > 0 && (
                      <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">{user?.name || 'Guest'}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email || 'Disconnected'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileNav && <button onClick={() => setMobileNav(false)} className="fixed inset-0 z-20 bg-slate-900/20 lg:hidden" />}

      {/* MAIN CONTAINER */}
      <div className="lg:pl-64 pb-20 sm:pb-8">
        <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(true)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden">
              <SlidersHorizontal className="size-5" />
            </button>
            <img src="/app-logo.png" alt="Logo" className="size-9 rounded-xl object-contain shadow-xs" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 leading-none">Invoix</span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">Billing Platform</span>
            </div>
          </div>
          <div className="relative flex items-center gap-2.5">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION POPOVER DROPDOWN */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400">
                        <Bell className="mx-auto size-8 opacity-40 mb-2" />
                        <p className="text-xs">No notifications right now</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`group relative flex items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer ${
                            n.read
                              ? 'bg-slate-50/50 hover:bg-slate-100/80'
                              : 'bg-indigo-50/40 hover:bg-indigo-50/70 border border-indigo-100/50'
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                              n.type === 'invoice'
                                ? 'bg-indigo-100 text-indigo-600'
                                : n.type === 'user'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <FileText className="size-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-bold truncate ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>

                          <button
                            onClick={(e: React.MouseEvent) => clearNotification(n.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md transition-opacity"
                            title="Dismiss"
                          >
                            <X className="size-3.5" />
                          </button>

                          {!n.read && (
                            <span className="absolute top-3 right-3 size-2 rounded-full bg-indigo-600 ring-2 ring-white" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DE'}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] p-4 sm:p-8">
          {/* HEADER BAR */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-medium text-indigo-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {active === 'Overview' ? `Welcome, ${user?.name || 'Partner'}` : active}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {active === 'Overview'
                  ? 'Real-time billing performance and operational statistics.'
                  : `Manage all your ${active.toLowerCase()} directly synced with MongoDB.`}
              </p>
            </div>
            <button
              onClick={loadWorkspaceData}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="size-3.5" /> Refresh Live Data
            </button>
          </div>

          {/* VIEW: OVERVIEW (DASHBOARD) */}
          {active === 'Overview' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <CircleDollarSign className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">Today&apos;s Sales</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboardData?.todaySales || 0, company?.defaultCurrency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <ShoppingCart className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">Current Month Revenue</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboardData?.currentMonthSales || 0, company?.defaultCurrency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <WalletCards className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">Outstanding Balance</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(dashboardData?.totalOutstanding || 0, company?.defaultCurrency)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <FileText className="size-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">Active Invoices</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{dashboardData?.totalInvoices || invoices.length}</p>
                </div>
              </div>

              {/* RECENT INVOICES */}
              <div className="mt-6 rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-semibold text-slate-900">Live Invoices</h2>
                    <p className="text-xs text-slate-500">Latest business billing transactions</p>
                  </div>
                  <button onClick={() => setActive('Invoices')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    View full invoice manager →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Invoice #</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Issue Date</th>
                        <th className="px-5 py-3">Total TTC</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.slice(0, 5).map((inv: any) => (
                        <tr key={inv._id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3.5 font-semibold text-slate-800">{inv.invoiceNumber || 'DRAFT'}</td>
                          <td className="px-5 py-3.5">{inv.customerId?.name || 'Customer'}</td>
                          <td className="px-5 py-3.5 text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {formatCurrency(inv.totalTTC, inv.currency)}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => handleEditInvoice(inv)}
                                    className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                                  >
                                    <Pencil className="size-3 mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleFinalizeInvoice(inv._id)}
                                    className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  >
                                    <FileCheck2 className="size-3 mr-1" /> Finalize
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvoice(inv._id)}
                                    className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50/50 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                                  >
                                    <Trash2 className="size-3 mr-1" /> Delete
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDownloadPdf(inv._id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                                title="Download PDF"
                              >
                                <Download className="size-3.5 stroke-[2.5]" /> PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                            No invoices issued yet. Click &quot;New Invoice&quot; to generate your first draft.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VIEW: INVOICES LIST */}
          {active === 'Invoices' && (() => {
            const filteredInvoices = invoices.filter((inv) => {
              if (!invoiceSearchQuery.trim()) return true
              const q = invoiceSearchQuery.toLowerCase()
              const invNum = (inv.invoiceNumber || '').toLowerCase()
              const custName = (inv.customerId?.name || '').toLowerCase()
              const status = (inv.status || '').toLowerCase()
              return invNum.includes(q) || custName.includes(q) || status.includes(q)
            })

            return (
              <div className="space-y-4">
                {/* Search & Filter bar for mobile/desktop */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 size-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={invoiceSearchQuery}
                      onChange={(e: any) => setInvoiceSearchQuery(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 shadow-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    title="Filter Invoices"
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <SlidersHorizontal className="size-4 text-slate-500" />
                  </button>
                </div>

                {/* Subtitle Header */}
                <div className="flex items-center justify-between pt-1">
                  <h2 className="text-base font-bold text-slate-900">All Invoices ({filteredInvoices.length})</h2>
                  <Button
                    onClick={() => {
                      setEditingInvoiceId(null)
                      setSelectedCustomerId('')
                      setInvoiceItems([{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }])
                      setShowNewInvoiceModal(true)
                    }}
                    className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="size-4" /> Create Invoice
                  </Button>
                </div>

                {/* Mobile Cards View (< sm) */}
                <div className="grid gap-3.5 sm:hidden">
                  {filteredInvoices.map((inv: any) => (
                    <div key={inv._id} className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs space-y-3">
                      {/* Card Header: INV # & Status */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-bold text-slate-900 text-sm tracking-tight">{inv.invoiceNumber || 'DRAFT'}</span>
                        <StatusBadge status={inv.status} />
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-500 font-medium">
                            <User className="size-3.5 text-slate-400" />
                            Customer
                          </span>
                          <span className="font-semibold text-slate-800">{inv.customerId?.name || 'Customer'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-500 font-medium">
                            <FileText className="size-3.5 text-slate-400" />
                            Due date
                          </span>
                          <span className="font-medium text-slate-700">{new Date(inv.dueDate || inv.invoiceDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-slate-500 font-medium">
                            <FileCheck2 className="size-3.5 text-slate-400" />
                            Total TTC
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{formatCurrency(inv.totalTTC, inv.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-2 text-slate-500 font-medium">
                            <WalletCards className="size-3.5 text-indigo-500" />
                            Amount due
                          </span>
                          <span className="font-extrabold text-indigo-700 text-sm">{formatCurrency(inv.amountDue, inv.currency)}</span>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                        <button
                          onClick={() => handleDownloadPdf(inv._id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                          <Download className="size-4 stroke-[2.5]" /> Download PDF
                        </button>
                        <div className="flex items-center gap-1">
                          {inv.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleEditInvoice(inv)}
                                className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit Draft"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                onClick={() => handleFinalizeInvoice(inv._id)}
                                className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Finalize Invoice"
                              >
                                <FileCheck2 className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv._id)}
                                className="rounded-xl p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                      No invoices found.
                    </div>
                  )}
                </div>

                {/* Desktop Table View (>= sm) */}
                <div className="hidden sm:block rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Invoice #</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Due Date</th>
                        <th className="px-5 py-3">Total TTC</th>
                        <th className="px-5 py-3">Amount Due</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv: any) => (
                        <tr key={inv._id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-4 font-semibold text-slate-800">{inv.invoiceNumber || 'DRAFT'}</td>
                          <td className="px-5 py-4">{inv.customerId?.name || 'Customer'}</td>
                          <td className="px-5 py-4 text-slate-500">{new Date(inv.dueDate || inv.invoiceDate).toLocaleDateString()}</td>
                          <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(inv.totalTTC, inv.currency)}</td>
                          <td className="px-5 py-4 font-medium text-rose-600">{formatCurrency(inv.amountDue, inv.currency)}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status === 'draft' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditInvoice(inv)}
                                    className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                  >
                                    <Pencil className="size-3.5 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleFinalizeInvoice(inv._id)}
                                    className="h-8 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                  >
                                    <FileCheck2 className="size-3.5 mr-1" /> Finalize
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteInvoice(inv._id)}
                                    className="h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg"
                                  >
                                    <Trash2 className="size-3.5 mr-1" /> Delete
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleDownloadPdf(inv._id)}
                                className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all"
                              >
                                <Download className="size-4 mr-1.5 stroke-[2.5]" /> PDF
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* VIEW: CUSTOMERS */}
          {active === 'Customers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Customer Directory ({customers.length})</h2>
                <Button onClick={() => { setEditingCustomerId(null); setNewCustName(''); setNewCustCompany(''); setNewCustEmail(''); setNewCustPhone(''); setNewCustTaxId(''); setShowNewCustomerModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm">
                  <Plus className="size-4" /> Add Customer
                </Button>
              </div>

              {/* Mobile Card List (< sm) */}
              <div className="grid gap-3.5 sm:hidden">
                {customers.map((c: any) => (
                  <div key={c._id} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      {c.companyName && <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{c.companyName}</span>}
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      {c.email && <div className="flex items-center gap-2"><span>✉</span> {c.email}</div>}
                      {c.phone && <div className="flex items-center gap-2"><span>📞</span> {c.phone}</div>}
                      {c.taxId && <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400"><span>🆔</span> {c.taxId}</div>}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button size="sm" variant="outline" onClick={() => handleEditCustomer(c)} className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-xl">
                        <Pencil className="size-3.5 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteCustomer(c._id)} className="h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="size-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                    No customers added yet.
                  </div>
                )}
              </div>

              {/* Desktop Table View (>= sm) */}
              <div className="hidden sm:block rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Customer Name</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Matricule Fiscal</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c: any) => (
                      <tr key={c._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{c.name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{c.companyName || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">{c.email || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">{c.phone || '—'}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{c.taxId || '—'}</td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCustomer(c)}
                              className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <Pencil className="size-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCustomer(c._id)}
                              className="h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="size-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: PRODUCTS */}
          {active === 'Products' && (
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h2 className="font-semibold text-slate-900">Product Catalog & Inventory ({products.length})</h2>
                <Button onClick={() => { setEditingProductId(null); setNewProdName(''); setNewProdRef(''); setNewProdOrigin('USA'); setNewProdPrice('10.000'); setNewProdStock('20'); setNewProdVat('19'); setShowNewProductModal(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="size-4" /> Add Product
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Product Name</th>
                      <th className="px-5 py-3">SKU / Ref</th>
                      <th className="px-5 py-3">Origin</th>
                      <th className="px-5 py-3">Selling Price</th>
                      <th className="px-5 py-3">VAT %</th>
                      <th className="px-5 py-3">In Stock</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p: any) => (
                      <tr key={p._id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{p.name}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{p.reference || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            {getCountryDisplay(p.originCountry)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{formatCurrency(p.sellingPrice, compCurrency || company?.defaultCurrency)}</td>
                        <td className="px-5 py-3.5 text-slate-600">{p.vatRate}%</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{p.stockQuantity}</td>
                        <td className="px-5 py-3.5">
                          {p.stockQuantity <= (p.minStockLevel || 5) ? (
                            <span className="rounded bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">Low Stock</span>
                          ) : (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Available</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(p)}
                              className="h-8 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <Pencil className="size-3.5 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(p._id)}
                              className="h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="size-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: REPORTS */}
          {active === 'Reports' && (
            <div className="grid gap-6">
              <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-slate-900">Sales Reports by Date</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Invoices Count</th>
                        <th className="px-4 py-2">Sales HT</th>
                        <th className="px-4 py-2">VAT Collected</th>
                        <th className="px-4 py-2">Total TTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reports || []).map((r: any) => (
                        <tr key={r._id}>
                          <td className="px-4 py-3 font-medium">{r._id}</td>
                          <td className="px-4 py-3">{r.invoiceCount}</td>
                          <td className="px-4 py-3">{formatCurrency(r.totalSalesHT, compCurrency || company?.defaultCurrency)}</td>
                          <td className="px-4 py-3">{formatCurrency(r.totalVat, compCurrency || company?.defaultCurrency)}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">{formatCurrency(r.totalSalesTTC, compCurrency || company?.defaultCurrency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {active === 'Settings' && (
            <div className="max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Company Billing Profile</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Updates made here immediately apply to app navigation, invoice generation, numbering prefixes, and PDF billing headers.
                </p>
              </div>
              <form onSubmit={handleSaveCompanySettings} className="mt-6 grid gap-5 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Company Name *</label>
                  <input
                    required
                    value={compName}
                    onChange={(e: any) => setCompName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Matricule Fiscal (Tax ID)</label>
                    <input
                      placeholder="e.g. 1234567/A/M/000"
                      value={compTaxId}
                      onChange={(e: any) => setCompTaxId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Invoice Number Prefix</label>
                    <input
                      required
                      placeholder="e.g. INV, FACT"
                      value={compPrefix}
                      onChange={(e: any) => setCompPrefix(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Default Currency</label>
                    <select
                      value={compCurrency}
                      onChange={(e: any) => setCompCurrency(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="TND">TND (Tunisian Dinar)</option>
                      <option value="USD">USD (US Dollar $)</option>
                      <option value="EUR">EUR (Euro €)</option>
                      <option value="GBP">GBP (British Pound £)</option>
                      <option value="CAD">CAD (Canadian Dollar)</option>
                      <option value="AUD">AUD (Australian Dollar)</option>
                      <option value="CHF">CHF (Swiss Franc)</option>
                      <option value="DZD">DZD (Algerian Dinar)</option>
                      <option value="MAD">MAD (Moroccan Dirham)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="EGP">EGP (Egyptian Pound)</option>
                      <option value="QAR">QAR (Qatari Riyal)</option>
                      <option value="KWD">KWD (Kuwaiti Dinar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Default VAT Rate (%)</label>
                    <input
                      type="number"
                      value={compVatRate}
                      onChange={(e: any) => setCompVatRate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Contact Phone</label>
                    <input
                      placeholder="+216..."
                      value={compPhone}
                      onChange={(e: any) => setCompPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Billing Email</label>
                    <input
                      type="email"
                      placeholder="billing@company.com"
                      value={compEmail}
                      onChange={(e: any) => setCompEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6 font-semibold shadow-sm">
                    {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null} Save Company Profile
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CREATE INVOICE */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4">
          <div className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="size-5" />
              </button>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Create Invoice</h2>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">CUSTOMER *</label>
                <CustomerSelectPopover
                  customers={customers}
                  value={selectedCustomerId}
                  onChange={(id) => setSelectedCustomerId(id)}
                  onAddNewCustomer={(initialName = '') => {
                    setEditingCustomerId(null)
                    setNewCustName(initialName)
                    setNewCustCompany('')
                    setNewCustEmail('')
                    setNewCustPhone('')
                    setNewCustTaxId('')
                    setShowNewCustomerModal(true)
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">DUE DATE</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e: any) => setInvoiceDueDate(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* TAX / VAT CHECKBOX CARD */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="applyVatCheckbox"
                    checked={applyVat}
                    onChange={(e: any) => setApplyVat(e.target.checked)}
                    className="size-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="applyVatCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                    Calculate &amp; Apply Taxes / VAT (19% TVA)
                  </label>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${applyVat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                  {applyVat ? 'VAT Included' : 'No VAT'}
                </span>
              </div>

              {/* LINE ITEMS */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">LINE ITEMS</label>
                {invoiceItems.map((item: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Product *</span>
                      <ProductSelectPopover
                        products={products}
                        value={item.productId}
                        currency={compCurrency || company?.defaultCurrency}
                        onChange={(pid, price) => {
                          const copy = [...invoiceItems]
                          copy[idx].productId = pid
                          if (price !== undefined) copy[idx].unitPrice = price
                          setInvoiceItems(copy)
                        }}
                        onAddNewProduct={(initialName = '') => {
                          setActiveLineItemIdx(idx)
                          setEditingProductId(null)
                          setNewProdName(initialName)
                          setNewProdRef('')
                          setNewProdOrigin('USA')
                          setNewProdPrice('10.000')
                          setNewProdStock('20')
                          setShowNewProductModal(true)
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Quantity *</span>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...invoiceItems]
                              const q = Math.max(1, (copy[idx].quantity || 1) - 1)
                              copy[idx].quantity = q
                              setInvoiceItems(copy)
                            }}
                            className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs hover:bg-slate-100 active:scale-95"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...invoiceItems]
                              copy[idx].quantity = (copy[idx].quantity || 1) + 1
                              setInvoiceItems(copy)
                            }}
                            className="flex size-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs hover:bg-slate-100 active:scale-95"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInvoiceItems(invoiceItems.filter((_: any, i: number) => i !== idx))}
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete line item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setInvoiceItems([...invoiceItems, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }])}
                  className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 py-3 text-xs font-bold text-slate-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                >
                  <Plus className="size-4 text-indigo-600" /> Add Line Item
                </button>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 shrink-0">
              <Button
                variant="outline"
                onClick={() => handleCreateInvoice(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 py-3 font-semibold text-xs sm:text-sm"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-1" /> : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleCreateInvoice(true)}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-semibold text-xs sm:text-sm shadow-sm"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-1" /> : 'Finalize & Issue Invoice'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CUSTOMER */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form onSubmit={handleAddCustomer} className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">{editingCustomerId ? 'Edit Customer' : 'Add New Customer'}</h2>
            <p className="text-xs text-slate-500 mt-1">Manage client billing directory profile</p>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Full Name / Contact Name *</label>
                <input
                  required
                  placeholder="Full Name / Contact Name *"
                  value={newCustName}
                  onChange={(e: any) => setNewCustName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Company Legal Name</label>
                <input
                  placeholder="Company Legal Name"
                  value={newCustCompany}
                  onChange={(e: any) => setNewCustCompany(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newCustEmail}
                    onChange={(e: any) => setNewCustEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                  <input
                    placeholder="Phone Number (+216...)"
                    value={newCustPhone}
                    onChange={(e: any) => setNewCustPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Matricule Fiscal (Tax ID)</label>
                <input
                  placeholder="Matricule Fiscal (Tax ID)"
                  value={newCustTaxId}
                  onChange={(e: any) => setNewCustTaxId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewCustomerModal(false)} className="h-10 px-5 text-sm font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold shadow-sm">
                {editingCustomerId ? 'Update Customer' : 'Save Customer'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <form onSubmit={handleAddProduct} className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-slate-500 mt-1">Configure product pricing, origin country, and inventory levels</p>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Product Name *</label>
                <input
                  required
                  placeholder="Product Name *"
                  value={newProdName}
                  onChange={(e: any) => setNewProdName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">SKU / Reference Code</label>
                <input
                  placeholder="SKU / Reference Code"
                  value={newProdRef}
                  onChange={(e: any) => setNewProdRef(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Selling Price ({compCurrency || company?.defaultCurrency || 'TND'}) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder={`Selling Price (${compCurrency || company?.defaultCurrency || 'TND'}) *`}
                    value={newProdPrice}
                    onChange={(e: any) => setNewProdPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">VAT Rate (%)</label>
                  <input
                    type="number"
                    placeholder="VAT % (19)"
                    value={newProdVat}
                    onChange={(e: any) => setNewProdVat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Origin Country</label>
                  <CountrySelectPopover value={newProdOrigin} onChange={(code) => setNewProdOrigin(code)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="Stock Qty"
                    value={newProdStock}
                    onChange={(e: any) => setNewProdStock(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewProductModal(false)} className="h-10 px-5 text-sm font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold shadow-sm">
                {editingProductId ? 'Update Product' : 'Save Product'}
              </Button>
            </div>
          </form>
        </div>
      )}



      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <WalletCards className="size-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              {authMode === 'login' ? 'Sign in to Ledgerly' : 'Create Company Workspace'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {authMode === 'login' ? 'Enter your credentials to access your live billing data.' : 'Start managing invoices and stock.'}
            </p>

            {authError && <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-600">{authError}</p>}

            <form onSubmit={handleAuth} className="mt-5 grid gap-3">
              {authMode === 'register' && (
                <>
                  <input
                    required
                    placeholder="Company Legal Name"
                    value={authCompanyName}
                    onChange={(e: any) => setAuthCompanyName(e.target.value)}
                    className="rounded-lg border border-slate-200 p-2.5 text-sm"
                  />
                  <input
                    required
                    placeholder="Owner Full Name"
                    value={authName}
                    onChange={(e: any) => setAuthName(e.target.value)}
                    className="rounded-lg border border-slate-200 p-2.5 text-sm"
                  />
                </>
              )}
              <input
                required
                type="email"
                placeholder="Email address"
                value={authEmail}
                onChange={(e: any) => setAuthEmail(e.target.value)}
                className="rounded-lg border border-slate-200 p-2.5 text-sm"
              />
              <input
                required
                type="password"
                placeholder="Password (min. 6 chars)"
                value={authPassword}
                onChange={(e: any) => setAuthPassword(e.target.value)}
                className="rounded-lg border border-slate-200 p-2.5 text-sm"
              />

              <Button type="submit" disabled={isSubmitting} className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : authMode === 'login' ? 'Sign In' : 'Register Company'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <span>
                  Don&apos;t have a company account?{' '}
                  <button onClick={() => setAuthMode('register')} className="font-semibold text-indigo-600 hover:underline">
                    Register now
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button onClick={() => setAuthMode('login')} className="font-semibold text-indigo-600 hover:underline">
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) FOR MOBILE */}
      <button
        onClick={() => {
          setEditingInvoiceId(null)
          setSelectedCustomerId('')
          setInvoiceItems([{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }])
          setShowNewInvoiceModal(true)
        }}
        className="fixed bottom-20 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all sm:hidden"
        aria-label="Create Invoice"
      >
        <Plus className="size-7 stroke-[2.5]" />
      </button>

      {/* BOTTOM NAVIGATION BAR FOR MOBILE */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden px-2 shadow-lg">
        <button
          onClick={() => setActive('Overview')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            active === 'Overview' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="size-5" />
          Overview
        </button>
        <button
          onClick={() => setActive('Invoices')}
          className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            active === 'Invoices' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="size-5" />
          Invoices
          {active === 'Invoices' && <span className="absolute -bottom-1 h-0.5 w-7 rounded-full bg-indigo-600" />}
        </button>
        <button
          onClick={() => setActive('Customers')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            active === 'Customers' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="size-5" />
          Customers
        </button>
        <button
          onClick={() => setShowMobileMoreMenu(true)}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            ['Products', 'Reports', 'Settings'].includes(active) ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MoreHorizontal className="size-5" />
          More
        </button>
      </div>

      {/* MOBILE MORE MENU DRAWER */}
      {showMobileMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs sm:hidden">
          <div className="rounded-t-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">More Options</h3>
              <button onClick={() => setShowMobileMoreMenu(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setActive('Products'); setShowMobileMoreMenu(false); }}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left font-semibold text-xs transition-colors ${
                  active === 'Products' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Package className="size-5 text-indigo-500" />
                Products
              </button>
              <button
                onClick={() => { setActive('Reports'); setShowMobileMoreMenu(false); }}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left font-semibold text-xs transition-colors ${
                  active === 'Reports' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Boxes className="size-5 text-indigo-500" />
                Reports
              </button>
              <button
                onClick={() => { setActive('Settings'); setShowMobileMoreMenu(false); }}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left font-semibold text-xs transition-colors ${
                  active === 'Settings' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Settings className="size-5 text-indigo-500" />
                Settings
              </button>
              <button
                onClick={() => { handleLogout(); setShowMobileMoreMenu(false); }}
                className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-left font-semibold text-xs text-rose-600 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="size-5 text-rose-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-200 min-w-[320px] max-w-md">
          {toast.type === 'success' && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-xs">
              <CheckCircle2 className="size-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-xs">
              <XCircle className="size-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-xs">
              <Info className="size-5" />
            </div>
          )}
          <div className="flex-1 text-xs font-semibold text-slate-800 leading-snug">{toast.message}</div>
          <button onClick={() => setToast(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* PWA INSTALL PROMPT BANNER */}
      {showInstallBanner && (
        <div className="fixed top-4 inset-x-4 sm:left-auto sm:right-6 sm:max-w-md z-[110] flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs ring-1 ring-slate-200">
              <img src="/app-logo.png" alt="App Logo" className="size-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Install Invoix App</p>
              <p className="text-xs text-slate-500">Install on phone or PC for 1-tap fast access!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallAppClick}
              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all whitespace-nowrap"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Not now"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
