import { collection, doc, getDocs, query, setDoc, where, Timestamp, addDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { GridForecast, Neighborhood } from '../types';

export async function seedInitialData() {
  const neighborhoodsRef = collection(db, 'neighborhoods');
  const nSnap = await getDocs(neighborhoodsRef);
  
  if (nSnap.empty) {
    console.log('Seeding initial data...');
    const neighborhoods: Partial<Neighborhood>[] = [
      { id: 'zone-01', name: 'Mount Pleasant', transformerCapacityKw: 500, currentLoadKw: 320 },
      { id: 'zone-02', name: 'Avondale', transformerCapacityKw: 450, currentLoadKw: 380 },
      { id: 'zone-03', name: 'Borrowdale', transformerCapacityKw: 800, currentLoadKw: 600 },
      { id: 'zone-04', name: 'Mbare', transformerCapacityKw: 300, currentLoadKw: 280 },
    ];

    for (const n of neighborhoods) {
      await setDoc(doc(db, 'neighborhoods', n.id!), n);
    }

    const forecastsRef = collection(db, 'forecasts');
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const stressLevel = Math.floor(Math.random() * 60) + 20 + (i > 17 && i < 21 ? 30 : 0); // Peak evening hours
      await addDoc(forecastsRef, {
        forecastTime: Timestamp.fromDate(forecastTime),
        stressLevel: Math.min(stressLevel, 100),
        demandKw: 400 + Math.random() * 200,
        capacityKw: 600,
        message: stressLevel > 80 ? 'CRITICAL LOAD EXPECTED' : 'Normal Operations'
      });
    }
  }
}
