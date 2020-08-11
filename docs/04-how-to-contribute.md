---
id: how-to-contribute
title: How to contribute
hide_title: true
---

# How to contribute

> Filecoin.js open source library project is under very active development and is also being used to ship code to anyone who wants to contribute to Filecoin ecosystem. This document is intended to make the process for contributing clear and to answer some questions that you may have.

## [Code of Conduct]("https://www.github.com")
Filecoin.js team has adopted the [Contributor Covenant]("https://www.contributor-covenant.org") as its Code of Conduct, and we expect project participants to adhere to it. Please read the [full text]("https://www.github.com") so that you can understand what actions will and will not be tolerated.

## Open Development
All work on Filecoin.js happens directly on [GitHub]("https://www.github.com"). Both core team members and external contributors send pull requests which go through the same review process.

## Semantic Versioning
Filecoin.js follows [semantic versioning]("https://semver.org"). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes. When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance.

## Bugs

### Where to Find Known Issues
We are using [GitHub Issues]("https://www.github.com") for our public bugs. We keep a close eye on this and try to make it clear when we have an internal fix in progress. Before filing a new task, try to make sure your problem doesn’t already exist.

## Proposing a Change
If you intend to change the public API, or make any non-trivial changes to the implementation, we recommend filing an issue. This lets us reach an agreement on your proposal before you put significant effort into it.

If you’re only fixing a bug, it’s fine to submit a pull request right away but we still recommend to file an issue detailing what you’re fixing. This is helpful in case we don’t accept that specific fix but want to keep track of the issue.

## Your First Pull Request
If you decide to fix an issue, please be sure to check the comment thread in case somebody is already working on a fix. If nobody is working on it at the moment, please leave a comment stating that you intend to work on it so other people don’t accidentally duplicate your effort.

If somebody claims an issue but doesn’t follow up for more than two weeks, it’s fine to take it over but you should still leave a comment.

## Sending a Pull Request
The core team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

Before submitting a pull request, please make sure the following is done:

1. Fork the repository and create your branch from `master`.
2. Run `yarn` in the repository root.
3. If you’ve fixed a bug or added code that should be tested, add tests!
10. Make sure your code lints (`yarn lint`).

**TODO:** Add testing instructions

