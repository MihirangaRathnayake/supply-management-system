# 🎨 Modern Component Showcase

## New Reusable Components

All components are fully customizable and can be used throughout your application.

---

## 1. AnimatedButton

### Variants
```jsx
// Primary (Blue-Purple-Pink gradient)
<AnimatedButton variant="primary" icon={faQrcode}>
  Primary Action
</AnimatedButton>

// Secondary (Dark gradient)
<AnimatedButton variant="secondary" icon={faSync}>
  Secondary Action
</AnimatedButton>

// Success (Green gradient)
<AnimatedButton variant="success" icon={faCheck}>
  Success Action
</AnimatedButton>

// Danger (Red-Pink gradient)
<AnimatedButton variant="danger" icon={faTimes}>
  Danger Action
</AnimatedButton>

// Outline (White with border)
<AnimatedButton variant="outline" icon={faFilter}>
  Outline Action
</AnimatedButton>
```

### Sizes
```jsx
<AnimatedButton size="sm">Small</AnimatedButton>
<AnimatedButton size="md">Medium</AnimatedButton>
<AnimatedButton size="lg">Large</AnimatedButton>
<AnimatedButton size="xl">Extra Large</AnimatedButton>
```

### States
```jsx
// Loading
<AnimatedButton loading={true}>Loading...</AnimatedButton>

// Disabled
<AnimatedButton disabled={true}>Disabled</AnimatedButton>
```

---

## 2. StatusBadge

### Usage
```jsx
<StatusBadge 
  status="APPROVED"
  icon={faCheckCircle}
  gradient="from-blue-400 to-blue-500"
  label="Approved"
  size="md"
/>
```

### Sizes
```jsx
<StatusBadge size="sm" label="Small" gradient="from-blue-400 to-blue-500" />
<StatusBadge size="md" label="Medium" gradient="from-purple-400 to-purple-500" />
<StatusBadge size="lg" label="Large" gradient="from-pink-400 to-pink-500" />
```

### Animated
```jsx
<StatusBadge 
  label="Urgent" 
  gradient="from-red-400 to-red-500"
  animated={true}
/>
```

---

## 3. SearchBar

### Basic
```jsx
<SearchBar 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search..."
/>
```

### With Clear
```jsx
<SearchBar 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onClear={() => setSearchTerm('')}
  placeholder="Search orders..."
/>
```

---

## 4. ModernCard

### Basic
```jsx
<ModernCard>
  <div className="p-6">
    Content here
  </div>
</ModernCard>
```

### With Effects
```jsx
// Hover effect
<ModernCard hover={true}>
  Content
</ModernCard>

// Glow effect
<ModernCard glow={true}>
  Content
</ModernCard>

// Gradient background
<ModernCard gradient={true}>
  Content
</ModernCard>

// All effects
<ModernCard hover={true} glow={true} gradient={true}>
  Content
</ModernCard>
```

---

## 5. Skeleton

### Single Card
```jsx
import { SkeletonCard } from '../components/Skeleton';

<SkeletonCard />
```

### Multiple Cards
```jsx
import { SkeletonList } from '../components/Skeleton';

<SkeletonList count={6} />
```

---

## 6. ProgressBar

### Basic
```jsx
<ProgressBar value={75} max={100} />
```

### With Label
```jsx
<ProgressBar 
  value={75} 
  max={100}
  showLabel={true}
/>
```

### Sizes
```jsx
<ProgressBar size="sm" value={50} max={100} />
<ProgressBar size="md" value={75} max={100} />
<ProgressBar size="lg" value={90} max={100} />
```

### Without Gradient
```jsx
<ProgressBar 
  value={60} 
  max={100}
  gradient={false}
/>
```

---

## 7. StatCard

### Basic
```jsx
<StatCard 
  icon={faClipboardList}
  label="Total Orders"
  value={150}
  gradient="from-blue-500 to-blue-600"
/>
```

### With Trend
```jsx
<StatCard 
  icon={faDollarSign}
  label="Total Value"
  value="$125K"
  gradient="from-purple-500 to-purple-600"
  trend="up"
  trendValue="12%"
/>

<StatCard 
  icon={faChartLine}
  label="Conversion"
  value="8.5%"
  gradient="from-red-500 to-red-600"
  trend="down"
  trendValue="3%"
/>
```

---

## 🎨 Color Gradients

### Available Gradients
```css
/* Blue */
from-blue-400 to-blue-600
from-blue-500 to-blue-600

/* Purple */
from-purple-400 to-purple-600
from-purple-500 to-purple-600

/* Pink */
from-pink-400 to-pink-600
from-pink-500 to-pink-600

/* Green */
from-green-400 to-green-600
from-green-500 to-green-600

/* Red */
from-red-400 to-red-600
from-red-500 to-red-600

/* Multi-color */
from-blue-500 via-purple-500 to-pink-500
from-blue-400 via-purple-400 to-pink-400
```

---

## 🎯 Usage Tips

### 1. Consistent Spacing
```jsx
<div className="space-y-6">
  <ModernCard>Card 1</ModernCard>
  <ModernCard>Card 2</ModernCard>
</div>
```

### 2. Grid Layouts
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <ModernCard>Card 1</ModernCard>
  <ModernCard>Card 2</ModernCard>
  <ModernCard>Card 3</ModernCard>
</div>
```

### 3. Button Groups
```jsx
<div className="flex gap-3">
  <AnimatedButton variant="primary">Save</AnimatedButton>
  <AnimatedButton variant="outline">Cancel</AnimatedButton>
</div>
```

### 4. Stat Dashboard
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard icon={faUsers} label="Users" value={1234} gradient="from-blue-500 to-blue-600" />
  <StatCard icon={faBox} label="Orders" value={567} gradient="from-purple-500 to-purple-600" />
  <StatCard icon={faDollarSign} label="Revenue" value="$89K" gradient="from-pink-500 to-pink-600" />
  <StatCard icon={faChartLine} label="Growth" value="+12%" gradient="from-green-500 to-green-600" />
</div>
```

---

## 🚀 Quick Start

### Import Components
```jsx
import AnimatedButton from '../components/AnimatedButton';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import ModernCard from '../components/ModernCard';
import { SkeletonList } from '../components/Skeleton';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
```

### Use in Your Page
```jsx
function MyPage() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={faBox} label="Total" value={100} gradient="from-blue-500 to-blue-600" />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonList count={6} />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <ModernCard hover={true}>
            Content
          </ModernCard>
        </div>
      )}

      {/* Actions */}
      <AnimatedButton 
        variant="primary"
        onClick={handleSave}
        loading={loading}
      >
        Save Changes
      </AnimatedButton>
    </div>
  );
}
```

---

## 🎨 Customization

### Extend Components
```jsx
// Custom button variant
<AnimatedButton 
  className="bg-gradient-to-r from-yellow-400 to-orange-500"
>
  Custom Gradient
</AnimatedButton>

// Custom card style
<ModernCard className="border-4 border-purple-500">
  Custom Border
</ModernCard>
```

### Override Styles
```jsx
<AnimatedButton 
  variant="primary"
  className="!px-12 !py-6 !text-2xl"
>
  Extra Large Custom
</AnimatedButton>
```

---

## ✨ Best Practices

1. **Use consistent gradients** across related components
2. **Match button variants** to action importance
3. **Show loading states** for async operations
4. **Use skeleton screens** instead of spinners
5. **Add hover effects** to interactive elements
6. **Keep animations subtle** (300ms duration)
7. **Use glow effects sparingly** for emphasis
8. **Maintain color hierarchy** (primary > secondary > outline)

---

## 🎉 Summary

You now have **7 modern, reusable components** that can be used throughout your application:

✅ AnimatedButton - 5 variants, 4 sizes
✅ StatusBadge - Gradient badges with icons
✅ SearchBar - Glow effect search
✅ ModernCard - Glassmorphism cards
✅ Skeleton - Loading states
✅ ProgressBar - Animated progress
✅ StatCard - Analytics display

All components are:
- Fully customizable
- Responsive
- Accessible
- Performant
- Production-ready
