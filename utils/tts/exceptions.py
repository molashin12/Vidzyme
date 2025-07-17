"""
Custom exceptions for the TTS system.
Provides clear, specific error messages for better debugging.
"""

from typing import Optional, Dict, Any


class TTSError(Exception):
    """Base exception for TTS system errors."""
    
    def __init__(self, message: str, error_code: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.error_code = error_code
        self.details = details or {}
    
    def __str__(self):
        base_msg = super().__str__()
        if self.error_code:
            base_msg = f"[{self.error_code}] {base_msg}"
        if self.details:
            details_str = ", ".join(f"{k}={v}" for k, v in self.details.items())
            base_msg = f"{base_msg} (Details: {details_str})"
        return base_msg


class APIKeyError(TTSError):
    """Raised when API key issues are encountered."""
    
    def __init__(self, provider: str, message: str, key_file: Optional[str] = None):
        super().__init__(
            message=f"{provider} API key error: {message}",
            error_code="API_KEY_ERROR",
            details={"provider": provider, "key_file": key_file}
        )
        self.provider = provider
        self.key_file = key_file


class ProviderError(TTSError):
    """Raised when TTS provider encounters an error."""
    
    def __init__(self, provider: str, message: str, status_code: Optional[int] = None):
        super().__init__(
            message=f"{provider} provider error: {message}",
            error_code="PROVIDER_ERROR",
            details={"provider": provider, "status_code": status_code}
        )
        self.provider = provider
        self.status_code = status_code


class ConfigurationError(TTSError):
    """Raised when configuration issues are encountered."""
    
    def __init__(self, message: str, config_file: Optional[str] = None, missing_keys: Optional[list] = None):
        super().__init__(
            message=f"Configuration error: {message}",
            error_code="CONFIG_ERROR",
            details={"config_file": config_file, "missing_keys": missing_keys}
        )
        self.config_file = config_file
        self.missing_keys = missing_keys or []


class VoiceNotFoundError(TTSError):
    """Raised when requested voice is not available."""
    
    def __init__(self, voice_key: str, provider: str, available_voices: Optional[list] = None):
        super().__init__(
            message=f"Voice '{voice_key}' not found for provider '{provider}'",
            error_code="VOICE_NOT_FOUND",
            details={"voice_key": voice_key, "provider": provider, "available_voices": available_voices}
        )
        self.voice_key = voice_key
        self.provider = provider
        self.available_voices = available_voices or []


class AudioGenerationError(TTSError):
    """Raised when audio generation fails."""
    
    def __init__(self, message: str, provider: str, text_length: Optional[int] = None):
        super().__init__(
            message=f"Audio generation failed: {message}",
            error_code="AUDIO_GENERATION_ERROR",
            details={"provider": provider, "text_length": text_length}
        )
        self.provider = provider
        self.text_length = text_length


class ProviderUnavailableError(TTSError):
    """Raised when a TTS provider is not available."""
    
    def __init__(self, provider: str, reason: str):
        super().__init__(
            message=f"Provider '{provider}' is not available: {reason}",
            error_code="PROVIDER_UNAVAILABLE",
            details={"provider": provider, "reason": reason}
        )
        self.provider = provider
        self.reason = reason


class TextTooLongError(TTSError):
    """Raised when text exceeds provider limits."""
    
    def __init__(self, provider: str, text_length: int, max_length: int):
        super().__init__(
            message=f"Text too long for {provider}: {text_length} chars (max: {max_length})",
            error_code="TEXT_TOO_LONG",
            details={"provider": provider, "text_length": text_length, "max_length": max_length}
        )
        self.provider = provider
        self.text_length = text_length
        self.max_length = max_length


class RateLimitError(TTSError):
    """Raised when API rate limits are exceeded."""
    
    def __init__(self, provider: str, retry_after: Optional[int] = None):
        super().__init__(
            message=f"Rate limit exceeded for {provider}",
            error_code="RATE_LIMIT_ERROR",
            details={"provider": provider, "retry_after": retry_after}
        )
        self.provider = provider
        self.retry_after = retry_after


class FileOperationError(TTSError):
    """Raised when file operations fail."""
    
    def __init__(self, operation: str, file_path: str, reason: str):
        super().__init__(
            message=f"File {operation} failed for '{file_path}': {reason}",
            error_code="FILE_OPERATION_ERROR",
            details={"operation": operation, "file_path": file_path, "reason": reason}
        )
        self.operation = operation
        self.file_path = file_path
        self.reason = reason


# Exception mapping for common HTTP status codes
HTTP_STATUS_EXCEPTIONS = {
    400: lambda provider, msg: ProviderError(provider, f"Bad request: {msg}", 400),
    401: lambda provider, msg: APIKeyError(provider, f"Unauthorized: {msg}"),
    403: lambda provider, msg: APIKeyError(provider, f"Forbidden: {msg}"),
    404: lambda provider, msg: ProviderError(provider, f"Not found: {msg}", 404),
    429: lambda provider, msg: RateLimitError(provider),
    500: lambda provider, msg: ProviderError(provider, f"Server error: {msg}", 500),
    502: lambda provider, msg: ProviderError(provider, f"Bad gateway: {msg}", 502),
    503: lambda provider, msg: ProviderError(provider, f"Service unavailable: {msg}", 503),
}


def create_http_exception(status_code: int, provider: str, message: str) -> TTSError:
    """Create appropriate exception based on HTTP status code."""
    exception_factory = HTTP_STATUS_EXCEPTIONS.get(
        status_code,
        lambda p, m: ProviderError(p, f"HTTP {status_code}: {m}", status_code)
    )
    return exception_factory(provider, message)


def handle_provider_exception(provider: str, exception: Exception) -> TTSError:
    """Convert generic exceptions to TTS-specific exceptions."""
    if isinstance(exception, TTSError):
        return exception
    
    error_message = str(exception)
    
    # Check for common error patterns
    if "api key" in error_message.lower() or "unauthorized" in error_message.lower():
        return APIKeyError(provider, error_message)
    elif "rate limit" in error_message.lower() or "too many requests" in error_message.lower():
        return RateLimitError(provider)
    elif "file" in error_message.lower() and ("not found" in error_message.lower() or "permission" in error_message.lower()):
        return FileOperationError("access", "unknown", error_message)
    else:
        return ProviderError(provider, error_message)