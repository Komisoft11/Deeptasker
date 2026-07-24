import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString, MaxLength } from 'class-validator'
import { GoalOption, RatingOption, UsabilityOption } from 'src/support/type'

export class FeedbackFormRequest {
  @ApiProperty({
    description: 'Overall rating of Deeptasker',
    example: RatingOption.GOOD
  })
  @IsEnum(RatingOption)
  rating: RatingOption

  @ApiProperty({
    description: 'What aspects did you like most?',
    example: 'Clean user interface and fast response times'
  })
  @IsString()
  @MaxLength(300)
  liked: string

  @ApiProperty({
    description: 'What aspects did you find frustrating or difficult?',
    example: 'Navigation between sections could be more intuitive'
  })
  @IsString()
  @MaxLength(300)
  frustrating: string

  @ApiProperty({
    description: 'What feature do you feel is missing?',
    example: 'Dark mode and keyboard shortcuts'
  })
  @IsString()
  @MaxLength(300)
  missingFeature: string

  @ApiProperty({
    description: 'How would you rate the usability?',
    example: UsabilityOption.VERY_EASY
  })
  @IsEnum(UsabilityOption)
  usability: UsabilityOption

  @ApiProperty({
    description: 'What is your primary goal when using this product?',
    example: GoalOption.STARTUP
  })
  goal: GoalOption | string

  @ApiProperty({
    description: 'Any additional comments or suggestions?',
    example: 'Would love to see mobile app version in the future'
  })
  @IsString()
  @MaxLength(300)
  extra: string
}
