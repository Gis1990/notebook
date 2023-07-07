import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Contact } from '@prisma/client';
import { Parser } from 'json2csv';
import { S3StorageAdapter } from '../../../adapters/file-storage.adapter/file.storage.adapter';

export class ConvertContactsToCsvCommand {
  constructor(public readonly dto: Contact[]) {}
}

@CommandHandler(ConvertContactsToCsvCommand)
export class ConvertContactsToCsvCommandHandler
  implements ICommandHandler<ConvertContactsToCsvCommand>
{
  constructor(public readonly storageAdapter: S3StorageAdapter) {}

  async execute(command: ConvertContactsToCsvCommand): Promise<any> {
    const correctData = command.dto.map(
      ({ id, userId, ...contact }) => contact,
    );
    const fields = Object.keys(correctData[0]);
    const json2csvParser = new Parser({ fields });
    const file = json2csvParser.parse(correctData);
    return await this.storageAdapter.saveFile(file);
  }
}
