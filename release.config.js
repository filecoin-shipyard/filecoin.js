module.exports = {
  plugins: [
    // analyzes your commit messages to determine the next semantic version
    "@semantic-release/commit-analyzer",
    // generates release notes based on the commit messages since the last release.
    "@semantic-release/release-notes-generator",
    // creates and updates a CHANGELOG.md file based on the release notes generated.
    "@semantic-release/changelog",
    // updates the version in package.json and creates a tarball in the release directory based on the files specified in package.json.
    // If the package isn’t marked as private in package.json, the new version of the package is published to NPM.
    ["@semantic-release/npm", {
      "tarballDir": "release",
      "npmPublish": false
    }],
    // creates a GitHub release titled and tagged with the new version.
    // The release notes are used in the description and the tarball created in the previous step is included as the release binary.
    // It also adds a comment to any Issues and Pull Requests linked in the commit message.
    ["@semantic-release/github", {
      "assets": "release/*.tgz"
    }],
    // commits the files modified in the previous steps (CHANGELOG.md, package.json, and package-lock.json) back to the repository.
    // The commit is tagged with vMAJOR.MINOR.PATCH and the commit message body includes the generated release notes.
    "@semantic-release/git"
  ],
  preset: "angular",
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'next',
    'next-major',
    {name: 'beta', prerelease: true},
    {name: 'alpha', prerelease: true}
  ]
}
