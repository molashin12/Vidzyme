"""
TTS Configuration UI Component
Provides a simple interface for configuring TTS providers and settings.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from typing import Dict, List, Optional

try:
    from .tts.tts_factory import TTSFactory
    from .tts_config import TTSConfig
    TTS_SYSTEM_AVAILABLE = True
except ImportError:
    TTS_SYSTEM_AVAILABLE = False


class TTSConfigUI:
    """Simple UI for configuring TTS settings."""
    
    def __init__(self, parent=None):
        self.parent = parent
        self.config = TTSConfig() if TTS_SYSTEM_AVAILABLE else None
        self.factory = TTSFactory() if TTS_SYSTEM_AVAILABLE else None
        
        # UI variables
        self.provider_var = tk.StringVar()
        self.voice_key_var = tk.StringVar()
        self.quality_var = tk.StringVar()
        self.use_enhanced_var = tk.BooleanVar()
        
        # Provider info
        self.provider_info = {}
        
    def create_config_frame(self, parent_frame):
        """Create the TTS configuration frame."""
        if not TTS_SYSTEM_AVAILABLE:
            # Fallback UI for legacy system
            return self._create_legacy_frame(parent_frame)
        
        # Main frame
        config_frame = ttk.LabelFrame(parent_frame, text="Voice Generation Settings", padding="10")
        
        # System selection
        system_frame = ttk.Frame(config_frame)
        system_frame.pack(fill="x", pady=(0, 10))
        
        ttk.Label(system_frame, text="TTS System:").pack(side="left")
        self.use_enhanced_var.set(True)
        ttk.Checkbutton(
            system_frame, 
            text="Use Enhanced Multi-Provider System",
            variable=self.use_enhanced_var,
            command=self._on_system_change
        ).pack(side="left", padx=(10, 0))
        
        # Enhanced system settings
        self.enhanced_frame = ttk.Frame(config_frame)
        self.enhanced_frame.pack(fill="x", pady=(0, 10))
        
        # Provider selection
        provider_frame = ttk.Frame(self.enhanced_frame)
        provider_frame.pack(fill="x", pady=(0, 5))
        
        ttk.Label(provider_frame, text="Provider:").pack(side="left")
        self.provider_combo = ttk.Combobox(
            provider_frame, 
            textvariable=self.provider_var,
            state="readonly",
            width=15
        )
        self.provider_combo.pack(side="left", padx=(10, 0))
        self.provider_combo.bind("<<ComboboxSelected>>", self._on_provider_change)
        
        # Provider info button
        ttk.Button(
            provider_frame,
            text="Info",
            command=self._show_provider_info,
            width=6
        ).pack(side="left", padx=(5, 0))
        
        # Voice selection
        voice_frame = ttk.Frame(self.enhanced_frame)
        voice_frame.pack(fill="x", pady=(0, 5))
        
        ttk.Label(voice_frame, text="Voice:").pack(side="left")
        self.voice_combo = ttk.Combobox(
            voice_frame,
            textvariable=self.voice_key_var,
            state="readonly",
            width=20
        )
        self.voice_combo.pack(side="left", padx=(10, 0))
        
        # Quality selection
        quality_frame = ttk.Frame(self.enhanced_frame)
        quality_frame.pack(fill="x", pady=(0, 5))
        
        ttk.Label(quality_frame, text="Quality:").pack(side="left")
        self.quality_combo = ttk.Combobox(
            quality_frame,
            textvariable=self.quality_var,
            values=["high", "standard", "cost_effective"],
            state="readonly",
            width=15
        )
        self.quality_combo.pack(side="left", padx=(10, 0))
        
        # Cost estimation
        self.cost_frame = ttk.Frame(self.enhanced_frame)
        self.cost_frame.pack(fill="x", pady=(5, 0))
        
        self.cost_label = ttk.Label(self.cost_frame, text="")
        self.cost_label.pack(side="left")
        
        # Legacy system settings
        self.legacy_frame = ttk.Frame(config_frame)
        
        legacy_label = ttk.Label(
            self.legacy_frame, 
            text="Legacy ElevenLabs system (voice_secret.txt required)"
        )
        legacy_label.pack()
        
        # Initialize values
        self._load_current_config()
        self._update_ui_state()
        
        return config_frame
    
    def _create_legacy_frame(self, parent_frame):
        """Create a simple frame for legacy system only."""
        config_frame = ttk.LabelFrame(parent_frame, text="Voice Generation Settings", padding="10")
        
        ttk.Label(
            config_frame,
            text="Using legacy ElevenLabs system\n(Enhanced system not available)"
        ).pack()
        
        return config_frame
    
    def _load_current_config(self):
        """Load current configuration values."""
        if not self.config:
            return
        
        try:
            # Load providers
            providers = ["auto"] + list(self.config.providers.keys())
            self.provider_combo['values'] = providers
            self.provider_var.set(self.config.default_provider or "auto")
            
            # Load voices
            voice_keys = list(self.config.voice_mappings.keys())
            self.voice_combo['values'] = voice_keys
            self.voice_key_var.set(voice_keys[0] if voice_keys else "")
            
            # Set quality
            self.quality_var.set(self.config.quality_preference)
            
            # Load provider info
            self._load_provider_info()
            
        except Exception as e:
            print(f"Error loading TTS config: {e}")
    
    def _load_provider_info(self):
        """Load provider information for display."""
        if not self.factory:
            return
        
        try:
            comparison = self.factory.get_provider_comparison(1000)
            for provider_data in comparison:
                name = provider_data['name']
                self.provider_info[name] = {
                    'cost_per_1k': provider_data.get('cost_per_1k_chars', 0),
                    'available': provider_data.get('available', False),
                    'features': provider_data.get('features', []),
                    'max_length': provider_data.get('max_text_length', 0)
                }
        except Exception as e:
            print(f"Error loading provider info: {e}")
    
    def _on_system_change(self):
        """Handle system selection change."""
        self._update_ui_state()
    
    def _on_provider_change(self, event=None):
        """Handle provider selection change."""
        self._update_cost_estimate()
    
    def _update_ui_state(self):
        """Update UI state based on system selection."""
        if self.use_enhanced_var.get():
            self.enhanced_frame.pack(fill="x", pady=(0, 10))
            self.legacy_frame.pack_forget()
        else:
            self.enhanced_frame.pack_forget()
            self.legacy_frame.pack(fill="x", pady=(0, 10))
    
    def _update_cost_estimate(self):
        """Update cost estimation display."""
        provider = self.provider_var.get()
        if not provider or provider == "auto" or not self.factory:
            self.cost_label.config(text="")
            return
        
        try:
            tts_provider = self.factory.get_provider(provider)
            cost_per_1k = tts_provider.get_cost_estimate(1000)
            
            info = self.provider_info.get(provider, {})
            available = info.get('available', False)
            status = "✓" if available else "✗"
            
            self.cost_label.config(
                text=f"{status} ${cost_per_1k:.4f} per 1K chars"
            )
        except Exception as e:
            self.cost_label.config(text=f"Error: {e}")
    
    def _show_provider_info(self):
        """Show detailed provider information."""
        provider = self.provider_var.get()
        if not provider or provider == "auto":
            messagebox.showinfo("Provider Info", "Select a specific provider to see details.")
            return
        
        info = self.provider_info.get(provider, {})
        if not info:
            messagebox.showinfo("Provider Info", "No information available for this provider.")
            return
        
        details = f"""Provider: {provider}
Available: {'Yes' if info.get('available', False) else 'No'}
Cost per 1K chars: ${info.get('cost_per_1k', 0):.4f}
Max text length: {info.get('max_length', 0)} chars
Features: {', '.join(info.get('features', []))}"""
        
        messagebox.showinfo("Provider Information", details)
    
    def get_current_settings(self) -> Dict:
        """Get current UI settings."""
        return {
            'use_enhanced': self.use_enhanced_var.get(),
            'provider': self.provider_var.get() if self.provider_var.get() != "auto" else None,
            'voice_key': self.voice_key_var.get(),
            'quality': self.quality_var.get()
        }
    
    def apply_settings(self, settings: Dict):
        """Apply settings to the UI."""
        if 'use_enhanced' in settings:
            self.use_enhanced_var.set(settings['use_enhanced'])
        if 'provider' in settings:
            self.provider_var.set(settings['provider'] or "auto")
        if 'voice_key' in settings:
            self.voice_key_var.set(settings['voice_key'])
        if 'quality' in settings:
            self.quality_var.set(settings['quality'])
        
        self._update_ui_state()
        self._update_cost_estimate()


def create_tts_config_dialog(parent=None):
    """Create a standalone TTS configuration dialog."""
    dialog = tk.Toplevel(parent) if parent else tk.Tk()
    dialog.title("TTS Configuration")
    dialog.geometry("500x400")
    
    # Create UI
    ui = TTSConfigUI(dialog)
    main_frame = ttk.Frame(dialog, padding="10")
    main_frame.pack(fill="both", expand=True)
    
    config_frame = ui.create_config_frame(main_frame)
    config_frame.pack(fill="x", pady=(0, 10))
    
    # Buttons
    button_frame = ttk.Frame(main_frame)
    button_frame.pack(fill="x")
    
    def on_ok():
        settings = ui.get_current_settings()
        print("TTS Settings:", settings)
        dialog.destroy()
    
    def on_cancel():
        dialog.destroy()
    
    ttk.Button(button_frame, text="OK", command=on_ok).pack(side="right", padx=(5, 0))
    ttk.Button(button_frame, text="Cancel", command=on_cancel).pack(side="right")
    
    return dialog, ui


if __name__ == "__main__":
    # Test the UI
    dialog, ui = create_tts_config_dialog()
    dialog.mainloop()