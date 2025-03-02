#!/usr/bin/env python3
# ESP32 mmWave Presence Sensor Configuration Tool
# This tool allows configuration and flashing of ESP32 mmWave sensors
# No virtual environment needed - uses system ESPHome installation
import sys
import os
import yaml
import re
import subprocess
import traceback
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import datetime

# Add ruamel.yaml import for better YAML handling with comments
try:
    from ruamel.yaml import YAML
except ImportError:
    # If ruamel.yaml is not available, we'll try to install it
    print("ruamel.yaml not found, trying to install it...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "ruamel.yaml"])
        from ruamel.yaml import YAML
        print("ruamel.yaml installed successfully!")
    except Exception as e:
        print(f"Failed to install ruamel.yaml: {e}")
        print("Comments in YAML files will not be preserved.")
        YAML = None

class ConfigToolApp:
    def __init__(self, root):
        self.root = root
        self.root.title("ESP32 mmWave Presence Sensor Configuration Tool")
        self.root.geometry("800x600")
        
        # Set dark theme
        self.setup_theme()
        
        # Initialize variables
        self.config_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "example-config.yaml")
        self.config_data = self.load_config()
        self.original_yaml_content = self.load_original_yaml()
        
        # Create UI elements
        self.setup_ui()
        
        # Fix any remaining white backgrounds
        self.fix_all_widget_backgrounds()
        
    def get_esphome_path(self):
        """Find the esphome executable path"""
        # Debug the PATH environment 
        print(f"Current PATH: {os.environ.get('PATH', '')}")
        
        try:
            if sys.platform == 'win32':
                # Windows - look for esphome.exe
                result = subprocess.run(['where', 'esphome'], capture_output=True, text=True)
                if result.returncode == 0:
                    path = result.stdout.strip().split('\n')[0]
                    print(f"Found ESPHome on Windows: {path}")
                    return path
            else:
                # Unix-like systems
                result = subprocess.run(['which', 'esphome'], capture_output=True, text=True)
                if result.returncode == 0:
                    path = result.stdout.strip()
                    print(f"Found ESPHome on Unix: {path}")
                    return path
        except Exception as e:
            print(f"Error finding ESPHome: {e}")
        
        # Try some common locations if not found in PATH
        common_paths = [
            '/usr/local/bin/esphome',
            '/usr/bin/esphome',
            os.path.expanduser('~/.local/bin/esphome'),
            '/opt/homebrew/bin/esphome',  # Common on M1 Macs
        ]
        
        for path in common_paths:
            if os.path.exists(path) and os.access(path, os.X_OK):
                print(f"Found ESPHome at common location: {path}")
                return path
        
        # If not found, try to find esphome Python module
        try:
            result = subprocess.run(['python3', '-m', 'esphome', '--version'], 
                                   capture_output=True, text=True)
            if result.returncode == 0:
                print(f"Found ESPHome as Python module")
                return 'python3 -m esphome'
        except:
            pass
            
        # If not found, default to just 'esphome' and hope for the best
        print("Could not determine ESPHome path, using default 'esphome'")
        return 'esphome'

    def setup_theme(self):
        # Set dark mode colors from color palette
        self.bg_color = "#121212"  # Background Dark
        self.bg_elevation1 = "#1E1E1E"  # Background Elevation 1 (for cards)
        self.bg_elevation2 = "#2A2A2A"  # Background Elevation 2 (for hover)
        self.fg_color = "#E0E0E0"  # Text Primary
        self.fg_secondary = "#A0A0A0"  # Text Secondary
        self.entry_bg = "#1E1E1E"  # Using Background Elevation 1 for input fields
        self.button_bg = "#3B82F6"  # Primary accent color for buttons
        self.button_fg = "#E0E0E0"  # Text Primary for button text
        self.highlight_bg = "#8B5CF6"  # Accent color for highlights/hover
        
        # Configure the style for ttk widgets
        style = ttk.Style()
        style.theme_use('clam')  # Use a theme that we can customize
        
        # Configure ttk elements with consistent dark theme
        style.configure('TFrame', background=self.bg_color)
        style.configure('TLabelFrame', background=self.bg_color)
        style.configure('TLabelFrame.Label', background=self.bg_color, foreground=self.fg_color)
        style.configure('TLabel', background=self.bg_color, foreground=self.fg_color)
        style.configure('TEntry', fieldbackground=self.entry_bg, foreground=self.fg_color)
        style.configure('TButton', 
                       background=self.button_bg, 
                       foreground=self.button_fg,
                       padding=(10, 5))
        style.map('TButton', 
                 background=[('active', self.highlight_bg)],
                 foreground=[('active', self.fg_color)])
        style.configure('TCheckbutton', 
                       background=self.bg_color, 
                       foreground=self.fg_color)
        style.map('TCheckbutton',
                 background=[('active', self.bg_color)],
                 foreground=[('active', self.fg_color)])
        
        # Configure scrollbar colors
        style.configure('TScrollbar', background=self.bg_elevation1, troughcolor=self.bg_color, 
                      arrowcolor=self.fg_color)
                 
        # Configure root window
        self.root.configure(bg=self.bg_color)
        
        # Override the background color of TLabelFrame inner area
        self.root.option_add('*TLabelframe*Labelframe.background', self.bg_color)
        self.root.option_add('*TLabelframe*Label.background', self.bg_color)
        self.root.option_add('*TLabelframe.background', self.bg_color)
        
        # Override any Tkinter native widget colors to match our theme
        self.root.option_add('*Background', self.bg_color)
        self.root.option_add('*Foreground', self.fg_color)
        self.root.option_add('*background', self.bg_color)
        self.root.option_add('*foreground', self.fg_color)
        self.root.option_add('*Entry.background', self.entry_bg)
        self.root.option_add('*Entry.foreground', self.fg_color)
        
    def load_original_yaml(self):
        """Load the original YAML file content to preserve comments and formatting"""
        try:
            with open(self.config_file_path, 'r') as f:
                return f.read()
        except Exception:
            return ""
            
    def load_config(self):
        try:
            with open(self.config_file_path, 'r') as file:
                return yaml.safe_load(file)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load configuration file: {e}")
            return {}
            
    def save_config(self):
        """Save the configuration to the example-config.yaml file while preserving comments if possible"""
        # This is now only used when initially loading the app or directly saving to the example file
        
        # Safety check to prevent saving an empty config
        if not self.config_data:
            messagebox.showerror("Error", "Configuration data is empty!")
            return False
            
        try:
            # Only use this method to update the example-config.yaml file
            if not self.config_file_path.endswith("example-config.yaml"):
                # For other files, use save_to_file instead
                return self.save_to_file(self.config_file_path)
                
            # Backup the original file
            backup_path = f"{self.config_file_path}.backup"
            if os.path.exists(self.config_file_path):
                with open(self.config_file_path, 'r') as src, open(backup_path, 'w') as dst:
                    dst.write(src.read())
            
            # Try to save with comment preservation using ruamel.yaml if available
            if 'YAML' in globals() and YAML is not None:
                yaml_handler = YAML()
                yaml_handler.preserve_quotes = True
                yaml_handler.indent(mapping=2, sequence=4, offset=2)
                
                # Parse the original YAML
                if self.original_yaml_content:
                    # Try to update the parsed YAML with our modified values
                    try:
                        from io import StringIO
                        original_yaml = yaml_handler.load(self.original_yaml_content)
                        
                        # Update the parsed YAML with our modified data
                        self.update_yaml_preserving_structure(original_yaml, self.config_data)
                        
                        # Write back to the file
                        with open(self.config_file_path, 'w') as file:
                            yaml_handler.dump(original_yaml, file)
                        
                        print("Configuration saved with comment preservation")
                        messagebox.showinfo("Success", "Configuration saved successfully with comments preserved!")
                        return True
                    except Exception as e:
                        print(f"Failed to save with comment preservation: {e}")
                        traceback.print_exc()
                        
            # Fallback to standard YAML if ruamel.yaml failed
            print("Falling back to standard YAML dump (comments will be lost)")
            with open(self.config_file_path, 'w') as file:
                yaml.dump(self.config_data, file, default_flow_style=False, sort_keys=False)
            
            messagebox.showinfo("Success", "Configuration saved successfully (comments not preserved)!")
            return True
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save configuration: {e}")
            traceback.print_exc()
            return False
            
    def update_yaml_preserving_structure(self, original, new_data):
        """Update the parsed YAML structure with our modified values"""
        # Update substitutions
        if 'substitutions' in original and 'substitutions' in new_data:
            for key in new_data['substitutions']:
                if key in original['substitutions']:
                    original['substitutions'][key] = new_data['substitutions'][key]
        
        # Update WiFi settings
        if 'wifi' in original and 'wifi' in new_data:
            if 'ssid' in original['wifi']:
                original['wifi']['ssid'] = new_data['wifi']['ssid']
            if 'password' in original['wifi']:
                original['wifi']['password'] = new_data['wifi']['password']
                
        # Update BLE RSSI MAC addresses
        if 'sensor' in original and 'sensor' in new_data:
            for i, orig_sensor in enumerate(original['sensor']):
                if orig_sensor.get('platform') == 'ble_rssi':
                    # Find matching sensor in new data
                    for new_sensor in new_data['sensor']:
                        if (new_sensor.get('platform') == 'ble_rssi' and 
                            new_sensor.get('name') == orig_sensor.get('name')):
                            # Update MAC address
                            orig_sensor['mac_address'] = new_sensor['mac_address']
                            break

    def setup_ui(self):
        # Create main frame with padding
        main_frame = ttk.Frame(self.root, padding="20", style='TFrame')
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create a canvas with scrollbar for the content
        canvas = tk.Canvas(main_frame, bg=self.bg_color, highlightthickness=0)
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=canvas.yview)
        content_frame = ttk.Frame(canvas, style='TFrame')
        
        canvas.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Create window inside canvas
        canvas_window = canvas.create_window((0, 0), window=content_frame, anchor="nw")
        
        # Make sure the canvas resizes with the window
        def configure_canvas(event):
            canvas.configure(scrollregion=canvas.bbox("all"))
            canvas.itemconfig(canvas_window, width=event.width)
        
        canvas.bind("<Configure>", configure_canvas)
        content_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        
        # Title Label
        title_label = ttk.Label(content_frame, text="ESP32 mmWave Presence Sensor Configuration", 
                              font=("Helvetica", 16))
        title_label.pack(pady=(0, 20))
        
        # Device section
        device_frame = ttk.LabelFrame(content_frame, text="Device Settings", padding=10)
        device_frame.pack(fill=tk.X, pady=10)
        
        # Name settings
        ttk.Label(device_frame, text="Device Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar(value=self.config_data.get('substitutions', {}).get('name', 'mmwave-pod1'))
        name_entry = ttk.Entry(device_frame, textvariable=self.name_var)
        name_entry.grid(row=0, column=1, sticky=tk.EW, pady=5, padx=5)
        ttk.Label(device_frame, text="(Keep under 24 chars)").grid(row=0, column=2, sticky=tk.W, pady=5)
        
        ttk.Label(device_frame, text="Friendly Name:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.friendly_name_var = tk.StringVar(value=self.config_data.get('substitutions', {}).get('friendly_name', 'mmWave Pod 1'))
        friendly_name_entry = ttk.Entry(device_frame, textvariable=self.friendly_name_var)
        friendly_name_entry.grid(row=1, column=1, sticky=tk.EW, pady=5, padx=5)
        
        # WiFi section
        wifi_frame = ttk.LabelFrame(content_frame, text="WiFi Settings", padding=10)
        wifi_frame.pack(fill=tk.X, pady=10)
        
        ttk.Label(wifi_frame, text="WiFi SSID:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.wifi_ssid_var = tk.StringVar(value=self.config_data.get('wifi', {}).get('ssid', 'YOUR_WIFI_SSID'))
        wifi_ssid_entry = ttk.Entry(wifi_frame, textvariable=self.wifi_ssid_var)
        wifi_ssid_entry.grid(row=0, column=1, sticky=tk.EW, pady=5, padx=5)
        
        ttk.Label(wifi_frame, text="WiFi Password:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.wifi_password_var = tk.StringVar(value=self.config_data.get('wifi', {}).get('password', 'YOUR_WIFI_PASSWORD'))
        wifi_password_entry = ttk.Entry(wifi_frame, textvariable=self.wifi_password_var, show="•")
        wifi_password_entry.grid(row=1, column=1, sticky=tk.EW, pady=5, padx=5)
        
        # Show password checkbox
        self.show_password_var = tk.BooleanVar(value=False)
        show_password_cb = ttk.Checkbutton(wifi_frame, text="Show Password", 
                                          variable=self.show_password_var, 
                                          command=lambda: self.toggle_password_visibility(wifi_password_entry))
        show_password_cb.grid(row=1, column=2, sticky=tk.W, pady=5)
        
        # BLE RSSI section
        ble_frame = ttk.LabelFrame(content_frame, text="BLE RSSI Settings", padding=10)
        ble_frame.pack(fill=tk.X, pady=10)
        
        # Get MAC addresses from the config or use placeholders
        mac_sensors = self.find_ble_rssi_sensors()
        
        ttk.Label(ble_frame, text="Occupant 1 MAC Address:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.mac1_var = tk.StringVar(value=mac_sensors.get(0, "XX:XX:XX:XX:XX:XX"))
        mac1_entry = ttk.Entry(ble_frame, textvariable=self.mac1_var)
        mac1_entry.grid(row=0, column=1, sticky=tk.EW, pady=5, padx=5)
        ttk.Label(ble_frame, text="Format: XX:XX:XX:XX:XX:XX").grid(row=0, column=2, sticky=tk.W, pady=5)
        
        ttk.Label(ble_frame, text="Occupant 2 MAC Address:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.mac2_var = tk.StringVar(value=mac_sensors.get(1, "YY:YY:YY:YY:YY:YY"))
        mac2_entry = ttk.Entry(ble_frame, textvariable=self.mac2_var)
        mac2_entry.grid(row=1, column=1, sticky=tk.EW, pady=5, padx=5)
        ttk.Label(ble_frame, text="Format: XX:XX:XX:XX:XX:XX").grid(row=1, column=2, sticky=tk.W, pady=5)
        
        # Action Buttons
        button_frame = ttk.Frame(content_frame)
        button_frame.pack(fill=tk.X, pady=20)
        
        # Configure columns for buttons
        button_frame.columnconfigure(0, weight=1)
        button_frame.columnconfigure(1, weight=1)
        button_frame.columnconfigure(2, weight=1)
        
        save_button = ttk.Button(button_frame, text="Save Configuration", 
                                command=self.save_configuration)
        save_button.grid(row=0, column=0, padx=5, pady=5, sticky=tk.EW)
        
        validate_button = ttk.Button(button_frame, text="Validate Configuration", 
                                   command=self.validate_configuration)
        validate_button.grid(row=0, column=1, padx=5, pady=5, sticky=tk.EW)
        
        flash_button = ttk.Button(button_frame, text="Flash Device", 
                                command=self.flash_device)
        flash_button.grid(row=0, column=2, padx=5, pady=5, sticky=tk.EW)
        
        # Status Bar
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(content_frame, textvariable=self.status_var, 
                             relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(fill=tk.X, side=tk.BOTTOM, pady=(10, 0))
        
    def find_ble_rssi_sensors(self):
        mac_addresses = {}
        try:
            # Find BLE RSSI sensors in the config data
            if 'sensor' in self.config_data:
                idx = 0
                for sensor in self.config_data['sensor']:
                    if sensor.get('platform') == 'ble_rssi' and 'mac_address' in sensor:
                        mac_addresses[idx] = sensor['mac_address']
                        idx += 1
        except Exception as e:
            print(f"Error finding BLE RSSI sensors: {e}")
        
        return mac_addresses
        
    def toggle_password_visibility(self, entry_widget):
        if self.show_password_var.get():
            entry_widget.config(show="")
        else:
            entry_widget.config(show="•")
    
    def validate_mac_address(self, mac):
        # Basic MAC address validation
        pattern = re.compile(r'^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$')
        return pattern.match(mac) is not None
        
    def save_configuration(self):
        # Update the configuration data with the values from the UI
        try:
            # Update name and friendly name
            if 'substitutions' not in self.config_data:
                self.config_data['substitutions'] = {}
            self.config_data['substitutions']['name'] = self.name_var.get()
            self.config_data['substitutions']['friendly_name'] = self.friendly_name_var.get()
            
            # Update WiFi settings
            if 'wifi' not in self.config_data:
                self.config_data['wifi'] = {}
            self.config_data['wifi']['ssid'] = self.wifi_ssid_var.get()
            self.config_data['wifi']['password'] = self.wifi_password_var.get()
            
            # Update MAC addresses
            mac1 = self.mac1_var.get()
            mac2 = self.mac2_var.get()
            
            # Validate MAC addresses
            if not self.validate_mac_address(mac1) and mac1 != "XX:XX:XX:XX:XX:XX":
                messagebox.showerror("Invalid MAC Address", f"Occupant 1 MAC address '{mac1}' is not valid.")
                return
                
            if not self.validate_mac_address(mac2) and mac2 != "YY:YY:YY:YY:YY:YY":
                messagebox.showerror("Invalid MAC Address", f"Occupant 2 MAC address '{mac2}' is not valid.")
                return
            
            # Find and update the BLE RSSI sensors
            sensors_updated = False
            if 'sensor' in self.config_data:
                for sensor in self.config_data['sensor']:
                    if sensor.get('platform') == 'ble_rssi':
                        if sensor.get('name') == 'Occupant 1 BLE RSSI':
                            sensor['mac_address'] = mac1
                            sensors_updated = True
                        elif sensor.get('name') == 'Occupant 2 BLE RSSI':
                            sensor['mac_address'] = mac2
                            sensors_updated = True
            
            # If sensors were not found, this might be an issue
            if not sensors_updated:
                messagebox.showwarning("Warning", "Could not find BLE RSSI sensors in the configuration.")
            
            # Create a timestamp-based filename for the new config
            timestamp = f"{self.name_var.get()}_{self.get_timestamp()}"
            new_config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{timestamp}.yaml")
            
            # Save to the new config file path
            self.save_to_file(new_config_path)
            
            # Update the config file path to use this new file
            self.config_file_path = new_config_path
            
            self.status_var.set(f"Configuration saved to {os.path.basename(new_config_path)}")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save configuration: {e}")
            self.status_var.set(f"Error: {e}")
            
    def validate_configuration(self):
        # Use ESPHome validate command to check the configuration
        try:
            self.status_var.set("Validating configuration...")
            self.root.update()
            
            # Check if we're already using a saved configuration file
            # If not, save a new one for validation
            if self.config_file_path.endswith("example-config.yaml"):
                # Create a new configuration file for validation
                timestamp = f"{self.name_var.get()}_{self.get_timestamp()}"
                new_config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{timestamp}.yaml")
                
                # Save to the new file path
                if not self.save_to_file(new_config_path):
                    return
                    
                # Update the config file path
                self.config_file_path = new_config_path
                self.status_var.set(f"Created new configuration file: {os.path.basename(new_config_path)}")
            
            # Run ESPHome validation
            esphome_path = self.get_esphome_path()
            # Use full paths and correct working directory
            config_file = os.path.basename(self.config_file_path)
            working_dir = os.path.dirname(os.path.abspath(self.config_file_path))
            
            # Print diagnostic info to help debug
            print(f"ESPHome path: {esphome_path}")
            print(f"Config file: {config_file}")
            print(f"Working directory: {working_dir}")
            
            # Handle if esphome is found as a Python module
            if esphome_path == 'python3 -m esphome':
                cmd = ['python3', '-m', 'esphome', 'config', config_file]
            else:
                cmd = [esphome_path, "config", config_file]
                
            print(f"Running command: {' '.join(cmd)} in {working_dir}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=working_dir
            )
            
            if result.returncode == 0:
                messagebox.showinfo("Validation Successful", f"The configuration ({config_file}) is valid!")
                self.status_var.set("Configuration validated successfully")
            else:
                error_msg = result.stderr if result.stderr else result.stdout
                messagebox.showerror("Validation Failed", f"Error in configuration:\n{error_msg}")
                print(f"Validation Error - STDOUT: {result.stdout}")
                print(f"Validation Error - STDERR: {result.stderr}")
                self.status_var.set("Configuration validation failed")
                
        except FileNotFoundError as e:
            messagebox.showerror("Error", f"ESPHome CLI not found: {e}\nPlease install ESPHome.")
            print(f"FileNotFoundError: {e}")
            self.status_var.set("ESPHome CLI not found")
        except Exception as e:
            messagebox.showerror("Error", f"Validation failed: {e}")
            print(f"Exception during validation: {e}")
            traceback.print_exc()
            self.status_var.set(f"Error: {e}")
            
    def flash_device(self):
        # Flash the firmware to the device
        try:
            # Check if we're already using a saved configuration file
            # If not, save a new one for flashing
            if self.config_file_path.endswith("example-config.yaml"):
                # Create a new configuration file for flashing
                timestamp = f"{self.name_var.get()}_{self.get_timestamp()}"
                new_config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"{timestamp}.yaml")
                
                # Save to the new file path
                if not self.save_to_file(new_config_path):
                    return
                    
                # Update the config file path
                self.config_file_path = new_config_path
                self.status_var.set(f"Created new configuration file: {os.path.basename(new_config_path)}")
            else:
                # If we're using an existing file, just make sure it's up to date
                if not self.save_to_file(self.config_file_path):
                    return
                
            # Ask user to confirm
            if not messagebox.askyesno("Confirm", f"This will flash the firmware to your ESP32 device using {os.path.basename(self.config_file_path)}. Continue?"):
                return
            
            # Set status
            self.status_var.set("Flashing device...")
            self.root.update()
            
            # Get the path to the esphome executable
            esphome_path = self.get_esphome_path()
            config_file_path = os.path.basename(self.config_file_path)
            working_dir = os.path.dirname(os.path.abspath(self.config_file_path))
            
            # Handle if esphome is found as a Python module
            if esphome_path == 'python3 -m esphome':
                cmd_prefix = "python3 -m esphome"
            else:
                cmd_prefix = esphome_path
            
            # Run ESPHome flash command in a new process window
            if sys.platform == 'win32':
                # Windows
                if esphome_path == 'python3 -m esphome':
                    subprocess.Popen(['start', 'cmd', '/k', 'python3', '-m', 'esphome', 'run', config_file_path], 
                                    shell=True, cwd=working_dir)
                else:
                    subprocess.Popen(['start', 'cmd', '/k', esphome_path, 'run', config_file_path], 
                                    shell=True, cwd=working_dir)
            elif sys.platform == 'darwin':
                # macOS - Use a shell script to avoid escaping issues
                print(f"Running on macOS for directory: {working_dir}")
                
                # Create a shell script to execute
                temp_script_path = os.path.join(working_dir, "run_esphome.sh")
                with open(temp_script_path, "w") as f:
                    f.write("#!/bin/bash\n")
                    f.write(f"cd '{working_dir}'\n")
                    f.write(f"{cmd_prefix} run {config_file_path}\n")
                    f.write("echo 'Press Enter to close this terminal'\n")
                    f.write("read\n")
                
                # Make it executable
                os.chmod(temp_script_path, 0o755)
                print(f"Created script at: {temp_script_path}")
                
                # Launch Terminal with the script
                simple_script = f'tell application "Terminal" to do script "bash \\"{temp_script_path}\\""'
                print(f"Running AppleScript: {simple_script}")
                
                try:
                    result = subprocess.run(['osascript', '-e', simple_script], capture_output=True, text=True)
                    print(f"AppleScript result: stdout={result.stdout}, stderr={result.stderr}, returncode={result.returncode}")
                except Exception as e:
                    print(f"AppleScript execution error: {e}")
                    raise
            else:
                # Linux
                subprocess.Popen(['x-terminal-emulator', '-e', f'cd "{working_dir}" && {cmd_prefix} run {config_file_path}'])
            
            self.status_var.set(f"Flashing using {config_file_path}. Command started in terminal.")
            
        except FileNotFoundError as e:
            messagebox.showerror("Error", f"ESPHome CLI not found: {e}\nPlease install ESPHome.")
            print(f"FileNotFoundError during flash: {e}")
            self.status_var.set("ESPHome CLI not found")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to flash device: {e}")
            print(f"Exception during flash: {e}")
            self.status_var.set(f"Error: {e}")
            traceback.print_exc()  # Print exception details for debugging

    def get_timestamp(self):
        """Generate a timestamp string for filename"""
        now = datetime.datetime.now()
        return now.strftime("%Y%m%d_%H%M%S")
        
    def save_to_file(self, file_path):
        """Save the configuration to the specified file path"""
        try:
            # Safety check to prevent saving an empty config
            if not self.config_data:
                messagebox.showerror("Error", "Configuration data is empty!")
                return False
                
            # Try to save with comment preservation using ruamel.yaml if available
            if 'YAML' in globals() and YAML is not None:
                yaml_handler = YAML()
                yaml_handler.preserve_quotes = True
                yaml_handler.indent(mapping=2, sequence=4, offset=2)
                
                with open(file_path, 'w') as file:
                    yaml_handler.dump(self.config_data, file)
                
                print(f"Configuration saved to {file_path}")
                return True
            else:
                # Fallback to standard YAML
                with open(file_path, 'w') as file:
                    yaml.dump(self.config_data, file, default_flow_style=False, sort_keys=False)
                
                print(f"Configuration saved to {file_path} (with standard YAML)")
                return True
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save configuration to {file_path}: {e}")
            traceback.print_exc()
            return False

    def fix_all_widget_backgrounds(self):
        """Recursively set background color for all widgets"""
        def set_bg(widget):
            widget_class = widget.winfo_class()
            
            # Handle different widget types appropriately
            try:
                # For ttk widgets (they use style instead of direct bg/fg)
                if widget_class.startswith('T'):
                    pass  # Skip ttk widgets as they're already styled
                
                # For standard Tkinter Entry widgets
                elif isinstance(widget, tk.Entry):
                    widget.configure(bg=self.entry_bg, fg=self.fg_color, 
                                   insertbackground=self.fg_color)
                
                # For standard Tkinter Canvas
                elif isinstance(widget, tk.Canvas):
                    widget.configure(bg=self.bg_color)
                
                # For any other standard Tkinter widget (not ttk)
                elif not widget_class.startswith('T'):
                    if 'background' in widget.config():
                        widget.configure(background=self.bg_color)
                    if 'foreground' in widget.config():
                        widget.configure(foreground=self.fg_color)
            except Exception as e:
                # If we encounter any error, just skip that widget
                pass

            # Process all children
            for child in widget.winfo_children():
                set_bg(child)
                
        # Start with the root window
        set_bg(self.root)
        
        # Force the window to update
        self.root.update_idletasks()

if __name__ == "__main__":
    root = tk.Tk()
    app = ConfigToolApp(root)
    root.mainloop()