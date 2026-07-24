enum RatingOption {
  VERY_BAD = '1',
  BAD = '2',
  NORMAL = '3',
  GOOD = '4',
  VERY_GOOD = '5'
}

enum UsabilityOption {
  VERY_EASY = 'veryEasy',
  EASY = 'easy',
  NEUTRAL = 'neutral',
  DIFFICULT = 'difficult',
  VERY_DIFFICULT = 'veryDifficult'
}

enum GoalOption {
  PERSONAL = 'personal',
  STARTUP = 'startup',
  MEDIUM_TEAM = 'mediumTeam',
  LARGE_TEAM = 'largeTeam',
  EDUCATION = 'education'
}

export interface FeedbackReportEvent {
  FEEDBACK_REPORT: {
    rating: RatingOption
    liked: string
    frustrating: string
    missingFeature: string
    usability: UsabilityOption
    goal: GoalOption | string
    extra: string
  }
}
