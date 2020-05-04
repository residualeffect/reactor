# Changelog

## [2.0.0] - 2020-05-03
### Added
* Added ObservableArray type to make working with arrays easier
* Added ObservableObject type to make working with complex objects easier
### Changed
* Change notifications no longer include the old value
* RateLimitedObservable has been replaced by the more flexible FilteredObservable (when used with the RateLimiter value filter)
### Removed
* Removed ReadOnlyObservable

## [1.3.0] - 2020-03-05
### Changed
* Computed observables will only subscribe to dependencies when the computed value is being observed by something, to prevent memory leaks

## [1.2.0] - 2020-03-02
### Changed
* Computed observables always track their dependencies and refresh automatically
### Fixed
* Improved error handling and provide a better error message when something goes wrong during computed value generation

## [1.0.0] - 2020-03-01
### Added
* Initial release, with support for observables, computed observables, and rate-limited observables
