import { Inject, Injectable } from '@nestjs/common';
import { INotificationStrategy } from './notification.strategy';

@Injectable()
export class StrategyRegistry {
  constructor(

    private readonly strategies: INotificationStrategy[],
  ) {}

  resolve(channel: string): INotificationStrategy {
    const strat = this.strategies.find((s) => s.canHandle(channel));
    if (!strat) {
      throw new Error(`No strategy for channel: ${channel}`);
    }
    return strat;
  }
}
