module.exports = {
  rules: {
    'cps-rule': [2, 'always'],
  },
  helpUrl: "If the problem persists contact the repo owner.",
  plugins: [
    {
      rules: {
        'cps-rule': ({header}) => {
          const regex = /^(CPS-[0-9]{2,3})\s|\s(feat|fix|test|docs|chore|ci):[^-\s](.*)$/;
          return [
            regex.test(header),
            `The commit message is not in the expected format!\nExpected Format: CPS-100 | feat: New exciting feature\nAllowed types are: feat|fix|test|docs|chore|ci`,
          ];
        },
      },
    },
  ],
};
