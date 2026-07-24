import { classes } from '@automapper/classes'

export function getAutomapperConfig() {
  return {
    strategyInitializer: classes()
  }
}
