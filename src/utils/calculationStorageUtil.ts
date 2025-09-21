import { CalculationOutputDTO } from '../dto/calculation-output.dto';

export class CalculationStorageUtil {
  private db: IDBDatabase | null = null;

  constructor(name: string, version: number) {
    const openRequest = indexedDB.open(name, version);

    openRequest.onupgradeneeded = () => {};

    openRequest.onsuccess = () => {
      this.db = openRequest.result;
    };
  }

  public addCalculation(calculation: CalculationOutputDTO): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.db !== null) {
        const transaction = this.db.transaction('calculations', 'readwrite');
        const store = transaction.objectStore('calculations');
        const query = store.put(calculation);
        query.onsuccess = () => {
          resolve(true);
        };
        query.onerror = (event: Event) => {
          console.error(event.target);
          reject(false);
        };
      } else {
        console.error('Database connection was already closed');
        reject(false);
      }
    });
  }

  public loadCalculations() {
    if (this.db !== null) {
      const transaction = this.db.transaction('calculations', 'readwrite');
      const store = transaction.objectStore('calculations');
      return store.getAll() as IDBRequest<CalculationOutputDTO[]>;
    } else console.error('Database connection was already closed');
  }

  public closeConnection() {
    if (this.db !== null) {
      this.db.close();
      this.db = null;
    }
  }
}
