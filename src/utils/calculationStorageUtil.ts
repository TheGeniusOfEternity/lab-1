import { CalculationOutputDTO } from '../dto/calculation-output.dto';

export class CalculationStorageUtil {
  private db: IDBDatabase | null = null;
  public ready: Promise<void>;

  constructor(name: string, version: number) {
    this.ready = new Promise<void>((resolve, reject) => {
      const openRequest = indexedDB.open(name, version);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains('calculations')) {
          db.createObjectStore('calculations', { keyPath: 'id', autoIncrement: true });
        }
      };

      openRequest.onsuccess = () => {
        this.db = openRequest.result;
        resolve();
      };

      openRequest.onerror = () => {
        reject(openRequest.error);
      };
    });
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

  public loadCalculations(): Promise<CalculationOutputDTO[]> {
    return new Promise((resolve, reject) => {
      if (this.db !== null) {
        const transaction = this.db.transaction('calculations', 'readwrite');
        const store = transaction.objectStore('calculations');
        const query: IDBRequest<CalculationOutputDTO[]> = store.getAll() as IDBRequest<CalculationOutputDTO[]>
        query.onsuccess = () => {
          resolve(query.result)
        }
      } else {
        console.error('Database connection was already closed');
        reject([])
      }
    })
  }

  public closeConnection() {
    if (this.db !== null) {
      this.db.close();
      this.db = null;
    }
  }
}
