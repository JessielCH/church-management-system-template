module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (commit) => !/^[a-z]+(\(.*\))?:/.test(commit) || commit.startsWith('Merge'),
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
  },
};
