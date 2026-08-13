export function getCategoryIcon(icon?: string, fallback = '📦'): string {
  if (!icon) return fallback;
  const str = icon.trim();
  if (!str) return fallback;

  // If already an emoji (1-4 characters and not plain alphanumeric letters)
  if (str.length <= 4 && !/^[a-zA-Z0-9_\-\s]+$/.test(str)) {
    return str;
  }

  const lower = str.toLowerCase();

  // Smart mapping for Lucide icon names and English text names
  if (lower.includes('water') || lower.includes('drink') || lower.includes('glass') || lower.includes('cup') || lower.includes('beverage')) return '🥤';
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('espresso')) return '☕';
  if (lower.includes('apple') || lower.includes('fruit') || lower.includes('lemon') || lower.includes('banana') || lower.includes('orange')) return '🍎';
  if (lower.includes('milk') || lower.includes('dairy') || lower.includes('cheese')) return '🥛';
  if (lower.includes('cookie') || lower.includes('biscuit') || lower.includes('cracker')) return '🍪';
  if (lower.includes('cake') || lower.includes('pie') || lower.includes('pastry') || lower.includes('sweet') || lower.includes('dessert')) return '🍰';
  if (lower.includes('bread') || lower.includes('bakery') || lower.includes('croissant')) return '🍞';
  if (lower.includes('pizza') || lower.includes('fastfood') || lower.includes('burger') || lower.includes('sandwich')) return '🍕';
  if (lower.includes('meat') || lower.includes('beef') || lower.includes('steak') || lower.includes('pork') || lower.includes('chicken')) return '🥩';
  if (lower.includes('fish') || lower.includes('seafood') || lower.includes('sushi')) return '🐟';
  if (lower.includes('soup') || lower.includes('bowl') || lower.includes('hotmeal') || lower.includes('dish') || lower.includes('utensils') || lower.includes('food')) return '🍲';
  if (lower.includes('salad') || lower.includes('veg') || lower.includes('greens')) return '🥗';
  if (lower.includes('icecream') || lower.includes('ice')) return '🍨';
  if (lower.includes('candy') || lower.includes('chocolate') || lower.includes('sugar')) return '🍬';
  if (lower.includes('beer') || lower.includes('wine') || lower.includes('alcohol') || lower.includes('bottle')) return '🍾';
  if (lower.includes('pill') || lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('med') || lower.includes('tablet')) return '💊';
  if (lower.includes('stethoscope') || lower.includes('syringe') || lower.includes('health') || lower.includes('firstaid')) return '🩺';
  if (lower.includes('scissors') || lower.includes('hair') || lower.includes('barber') || lower.includes('cut')) return '✂️';
  if (lower.includes('soap') || lower.includes('hygiene') || lower.includes('clean') || lower.includes('shampoo') || lower.includes('wash')) return '🧼';
  if (lower.includes('shirt') || lower.includes('cloth') || lower.includes('wear') || lower.includes('dress') || lower.includes('shoes')) return '👕';
  if (lower.includes('baby') || lower.includes('infant') || lower.includes('child')) return '🍼';
  if (lower.includes('box') || lower.includes('package') || lower.includes('parcel') || lower.includes('carton') || lower.includes('item')) return '📦';
  if (lower.includes('shopping') || lower.includes('bag') || lower.includes('cart') || lower.includes('store')) return '🛍️';
  if (lower.includes('folder') || lower.includes('tree') || lower.includes('archive') || lower.includes('category') || lower.includes('tag')) return '📁';
  if (lower.includes('phone') || lower.includes('tech') || lower.includes('electronic') || lower.includes('device') || lower.includes('gadget')) return '📱';
  if (lower.includes('sparkle') || lower.includes('star') || lower.includes('gift') || lower.includes('other')) return '✨';

  return fallback;
}
