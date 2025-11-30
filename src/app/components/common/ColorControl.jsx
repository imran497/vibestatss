import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import ColorPicker from "./ColorPicker";

export default function ColorControl({ label, value, onChange }) {
  const update = (key, val) => onChange({ ...value, [key]: val });

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="bg-card border rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">Gradient</span>
          <Switch
            checked={value.type === 'gradient'}
            onCheckedChange={(checked) => update('type', checked ? 'gradient' : 'solid')}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Color 1</label>
            <ColorPicker
              color={value.color1}
              onChange={(c) => update('color1', c)}
            />
          </div>

          {value.type === 'gradient' && (
            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Color 2</label>
              <ColorPicker
                color={value.color2}
                onChange={(c) => update('color2', c)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}