import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Pipette } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const PRESETS = [
    '#000000', '#ffffff', '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316'
];

export default function ColorPicker({ color, onChange, label }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const popover = useRef();
    const button = useRef();

    const close = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popover.current && !popover.current.contains(event.target) &&
                button.current && !button.current.contains(event.target)) {
                close();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && button.current) {
            const rect = button.current.getBoundingClientRect();
            const popoverHeight = 380; // Approximate height of popover
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Position above if not enough space below
            if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
                setPosition({
                    top: rect.top - popoverHeight - 8,
                    left: rect.left,
                });
            } else {
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                });
            }
        }
    }, [isOpen]);

    return (
        <div className="relative">
            <Button
                ref={button}
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 font-normal"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div
                    className="w-5 h-5 rounded border border-border"
                    style={{ backgroundColor: color }}
                />
                <span className="font-mono text-xs flex-1 text-left">{color}</span>
                <Pipette size={14} className="opacity-50" />
            </Button>

            {isOpen && (
                <div
                    className="fixed z-[9999]"
                    ref={popover}
                    style={{
                        top: position.top,
                        left: position.left,
                    }}
                >
                    <div className="bg-popover border rounded-lg shadow-2xl p-2 w-[220px]">
                        {/* Color Picker */}
                        <div className="mb-4">
                            <HexColorPicker color={color} onChange={onChange} className="w-full" />
                        </div>

                        {/* Preset Colors */}
                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">Presets</div>
                            <div className="grid grid-cols-6 gap-2">
                                {PRESETS.map((preset) => (
                                    <button
                                        type="button"
                                        key={preset}
                                        className="w-7 h-7 rounded-full border-2 border-border hover:border-primary hover:scale-110 transition-all"
                                        style={{ backgroundColor: preset }}
                                        onClick={() => onChange(preset)}
                                        title={preset}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Hex Input */}
                        <div className="space-y-1">
                            <Label className="text-xs">Hex Color</Label>
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => onChange(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
