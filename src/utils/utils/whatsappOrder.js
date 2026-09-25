import { formatPrice } from './formatPrice';

const fill = (template, settings) => template.replace('{artist_name}', settings.artist_name);

export function buildOrderMessage(items, settings) {
  const { greeting, signoff } = settings.checkout_message;
  const lines = [fill(greeting, settings), ''];
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.title}`);
    lines.push(`   ${it.medium} · ${it.dimensions}`);
    lines.push(`   ${formatPrice(it.price)}`);
    lines.push('');
  });
  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
  lines.push(`Order total: ${formatPrice(total)} for ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`);
  lines.push('');
  lines.push(fill(signoff, settings));
  return lines.join('\n');
}

export function buildWhatsappUrl(items, settings) {
  const number = String(settings.whatsapp_number || '').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(buildOrderMessage(items, settings))}`;
}