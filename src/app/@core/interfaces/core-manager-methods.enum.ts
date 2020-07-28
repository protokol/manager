export enum CoreManagerMethods {
  infoCoreVersion = 'info.coreVersion',
  infoCoreStatus = 'info.coreStatus',
  infoNextForgingSlot = 'info.nextForgingSlot',
  infoBlockchainHeight = 'info.blockchainHeight',
  infoCurrentDelegate = 'info.currentDelegate',
  infoLastForgedBlock = 'info.lastForgedBlock',
  logArchived = 'log.archived',
  logLog = 'log.log',
  processList = 'process.list',
  processRestart = 'process.restart',
  processStop = 'process.stop',
  configurationGetEnv = 'configuration.getEnv',
  configurationGetPlugins = 'configuration.getPlugins',
  configurationUpdatePlugins = 'configuration.updatePlugins',
  snapshotsList = 'snapshots.list',
  snapshotsDelete = 'snapshots.delete',
  snapshotsCreate = 'snapshots.create',
  snapshotsRestore = 'snapshots.restore',
}
