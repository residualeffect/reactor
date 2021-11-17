# Changelog

## [4.0.0] - 2021-11-17
### Added
 * Added the ability to use a custom equality comparison on any observable
   * This can be used to better detect when a value has not actually changed, preventing unnecessary subscriber notifications
   * Reactor will still use it's built-in default equality comparison, which tends to over-detect changes rather than under-detect them
### Changed
* Changed how Computed tracks subscriptions to prevent extra change notifications that can happen when one Computed depends on another Computed
### Breaking
* Dropped official support for node 10.x

## [3.0.0] - 2021-04-14
### Changed
* Changed behavior of ObservableArray.remove(x) such that it will remove all matching elements instead of just the first match (this also affects ObservableArray.toggle(x));

## [2.5.1] - 2020-07-27
### Added
* Exposed Computed ValueGenerator as a public readonly property
### Changed
* Improved example usage with react hooks readme

## [2.5.0] - 2020-06-09
### Added
* ObservableArray now has the ability to "toggle" an item (remove if present, else add)
### Fixed
* Observables will now notify even when the value is set to something "roughly" equivalent (for example, when an observable value is changed from `true` to `1`)

## [2.4.0] - 2020-05-12
### Added
* Added the ability to directly remove an item from an ObservableArray
* Starting to add JSDoc descriptions to public functions

## [2.3.0] - 2020-05-06
### Fixed
* ObservableArray now clones the array object when setting the value (rather than using the reference passed in, which the owner could still modify outside of the ObservableArray)
* An observable of an object or array type will now always notify observers when the Value is assigned (regardless of whether or not there have been any changes)
  * Consider using ObservableArray or ObservableObject instead

## [2.2.0] - 2020-05-06
### Added
* Added the ability to get a modifiable copy of an observable array

## [2.1.0] - 2020-05-05
### Added
* Added the ability to concatenate an array to an ObservableArray
* Added the ability to swap the position of two elements in an ObservableArray
* Added the ability to apply a custom Update transform to an ObservableArray
* Added shorthand accessor for checking length of ObservableArray
### Changed
* Changed some of the param types on ObservableArray to be readonly, and removed some return values from ObservableArray that generated modifiable array references in to the underlying array

## [2.0.0] - 2020-05-04
### Added
* Added ObservableArray type to make working with arrays easier
* Added ObservableObject type to make working with complex objects easier
### Changed
* Change notifications no longer include the old value
* RateLimitedObservable has been replaced by the more flexible FilteredObservable (when used with the RateLimiter value filter)
* Changed ReadOnlyObservable to be implemented as an interface rather than a base class to improve flexibility of concrete implementation details

## [1.3.0] - 2020-03-05
### Changed
* Computed observables will only subscribe to dependencies when the computed value is being observed by something, to prevent memory leaks

## [1.2.0] - 2020-03-03
### Changed
* Computed observables always track their dependencies and refresh automatically

## [1.1.0] - 2020-03-02
### Fixed
* Improved error handling and provide a better error message when something goes wrong during computed value generation

## [1.0.0] - 2020-03-01
### Added
* Initial release, with support for observables, computed observables, and rate-limited observables
