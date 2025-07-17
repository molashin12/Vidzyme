"""
Logging utilities for the TTS system.
Provides structured logging with different levels and output formats.
"""

import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import json


class TTSLogger:
    """Enhanced logger for TTS system with structured output."""
    
    def __init__(self, name: str = "TTS", log_level: str = "INFO", log_file: Optional[str] = None):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # Clear existing handlers
        self.logger.handlers.clear()
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
        
        # File handler (optional)
        if log_file:
            try:
                # Ensure log directory exists
                log_path = Path(log_file)
                log_path.parent.mkdir(parents=True, exist_ok=True)
                
                file_handler = logging.FileHandler(log_file, encoding='utf-8')
                file_handler.setFormatter(formatter)
                self.logger.addHandler(file_handler)
            except Exception as e:
                self.logger.warning(f"Could not create file handler for {log_file}: {e}")
    
    def debug(self, message: str, **kwargs):
        """Log debug message with optional context."""
        self._log_with_context(logging.DEBUG, message, **kwargs)
    
    def info(self, message: str, **kwargs):
        """Log info message with optional context."""
        self._log_with_context(logging.INFO, message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log warning message with optional context."""
        self._log_with_context(logging.WARNING, message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log error message with optional context."""
        self._log_with_context(logging.ERROR, message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log critical message with optional context."""
        self._log_with_context(logging.CRITICAL, message, **kwargs)
    
    def _log_with_context(self, level: int, message: str, **kwargs):
        """Log message with additional context."""
        if kwargs:
            context_str = " | ".join(f"{k}={v}" for k, v in kwargs.items())
            full_message = f"{message} | {context_str}"
        else:
            full_message = message
        
        self.logger.log(level, full_message)
    
    def log_api_call(self, provider: str, endpoint: str, status: str, duration: Optional[float] = None, **kwargs):
        """Log API call with structured information."""
        context = {
            "provider": provider,
            "endpoint": endpoint,
            "status": status,
            "duration_ms": round(duration * 1000) if duration else None,
            **kwargs
        }
        
        level = logging.INFO if status == "success" else logging.ERROR
        self._log_with_context(level, f"API call to {provider}", **context)
    
    def log_file_operation(self, operation: str, file_path: str, status: str, **kwargs):
        """Log file operation with structured information."""
        context = {
            "operation": operation,
            "file_path": file_path,
            "status": status,
            **kwargs
        }
        
        level = logging.INFO if status == "success" else logging.ERROR
        self._log_with_context(level, f"File {operation}", **context)
    
    def log_provider_selection(self, selected_provider: str, reason: str, alternatives: Optional[list] = None):
        """Log provider selection decision."""
        context = {
            "selected_provider": selected_provider,
            "reason": reason,
            "alternatives": alternatives or []
        }
        
        self._log_with_context(logging.INFO, "Provider selected", **context)
    
    def log_cost_estimate(self, provider: str, text_length: int, estimated_cost: float, **kwargs):
        """Log cost estimation."""
        context = {
            "provider": provider,
            "text_length": text_length,
            "estimated_cost": estimated_cost,
            **kwargs
        }
        
        self._log_with_context(logging.INFO, "Cost estimated", **context)


class PerformanceLogger:
    """Logger for performance metrics and timing."""
    
    def __init__(self, logger: TTSLogger):
        self.logger = logger
        self._timers: Dict[str, float] = {}
    
    def start_timer(self, operation: str):
        """Start timing an operation."""
        import time
        self._timers[operation] = time.time()
        self.logger.debug(f"Started timing: {operation}")
    
    def end_timer(self, operation: str, **context):
        """End timing an operation and log the duration."""
        import time
        if operation not in self._timers:
            self.logger.warning(f"Timer not found for operation: {operation}")
            return None
        
        duration = time.time() - self._timers[operation]
        del self._timers[operation]
        
        self.logger.info(
            f"Operation completed: {operation}",
            duration_ms=round(duration * 1000),
            **context
        )
        
        return duration
    
    def log_memory_usage(self, operation: str):
        """Log current memory usage."""
        try:
            import psutil
            process = psutil.Process()
            memory_mb = process.memory_info().rss / 1024 / 1024
            
            self.logger.info(
                f"Memory usage during {operation}",
                memory_mb=round(memory_mb, 2)
            )
        except ImportError:
            self.logger.debug("psutil not available for memory logging")


class DiagnosticLogger:
    """Logger for diagnostic and troubleshooting information."""
    
    def __init__(self, logger: TTSLogger):
        self.logger = logger
    
    def log_system_info(self):
        """Log system information for diagnostics."""
        import platform
        
        info = {
            "platform": platform.platform(),
            "python_version": platform.python_version(),
            "working_directory": os.getcwd(),
            "script_path": os.path.abspath(__file__) if __file__ else "unknown"
        }
        
        self.logger.info("System information", **info)
    
    def log_file_check(self, file_path: str, check_content: bool = False):
        """Log file existence and basic properties."""
        path = Path(file_path)
        
        if not path.exists():
            self.logger.warning(f"File not found: {file_path}")
            return
        
        info = {
            "file_path": str(path.absolute()),
            "size_bytes": path.stat().st_size,
            "readable": os.access(path, os.R_OK),
            "writable": os.access(path, os.W_OK)
        }
        
        if check_content and path.suffix.lower() in ['.txt', '.json', '.py']:
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    info["content_length"] = len(content)
                    info["has_content"] = len(content) > 0
                    
                    # For API key files, check if content looks like a key
                    if 'secret' in path.name.lower() or 'key' in path.name.lower():
                        info["looks_like_key"] = len(content) > 10 and content.isalnum()
                        
            except Exception as e:
                info["read_error"] = str(e)
        
        self.logger.info(f"File check: {path.name}", **info)
    
    def log_import_check(self, module_name: str):
        """Log module import status."""
        try:
            __import__(module_name)
            self.logger.info(f"Module import successful: {module_name}")
        except ImportError as e:
            self.logger.error(f"Module import failed: {module_name}", error=str(e))
        except Exception as e:
            self.logger.error(f"Unexpected error importing {module_name}", error=str(e))
    
    def log_config_validation(self, config: Dict[str, Any], required_keys: list):
        """Log configuration validation results."""
        missing_keys = [key for key in required_keys if key not in config]
        
        if missing_keys:
            self.logger.error("Configuration validation failed", missing_keys=missing_keys)
        else:
            self.logger.info("Configuration validation passed", config_keys=list(config.keys()))
        
        return len(missing_keys) == 0


# Global logger instance
_global_logger: Optional[TTSLogger] = None


def get_logger(name: str = "TTS", log_level: str = "INFO", log_file: Optional[str] = None) -> TTSLogger:
    """Get or create a TTS logger instance."""
    global _global_logger
    
    if _global_logger is None:
        # Try to create log file in the project directory
        if log_file is None:
            try:
                project_root = Path(__file__).parent.parent.parent
                log_file = str(project_root / "logs" / "tts.log")
            except:
                log_file = None
        
        _global_logger = TTSLogger(name, log_level, log_file)
    
    return _global_logger


def setup_logging(log_level: str = "INFO", log_file: Optional[str] = None) -> TTSLogger:
    """Setup logging for the TTS system."""
    global _global_logger
    _global_logger = TTSLogger("TTS", log_level, log_file)
    return _global_logger


# Convenience functions
def log_debug(message: str, **kwargs):
    """Log debug message using global logger."""
    get_logger().debug(message, **kwargs)


def log_info(message: str, **kwargs):
    """Log info message using global logger."""
    get_logger().info(message, **kwargs)


def log_warning(message: str, **kwargs):
    """Log warning message using global logger."""
    get_logger().warning(message, **kwargs)


def log_error(message: str, **kwargs):
    """Log error message using global logger."""
    get_logger().error(message, **kwargs)


def log_critical(message: str, **kwargs):
    """Log critical message using global logger."""
    get_logger().critical(message, **kwargs)