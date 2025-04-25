// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
// import axios from 'axios';
// import { RouteProp } from '@react-navigation/native';
// import { AdminMaidsStackParamList } from '../../navigation/AdminMaidsStack';

// type FeedbackRouteProp = RouteProp<AdminMaidsStackParamList, 'MaidFeedback'>;

// interface Props {
//   route: FeedbackRouteProp;
// }

// interface FeedbackItem {
//   comment: string;
//   rating: number;
//   [key:string]: any;
// }

// export default function MaidFeedbackScreen({ route }: Props) {
//   const { maidId } = route.params;
//   const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);


//   useEffect(() => {
//     axios.get(`/worker/feedback/${maidId}`)
//       .then(res => setFeedback(res.data))
//       .catch(err => console.error('Error fetching feedback:', err))
//       .finally(() => setLoading(false));
//   }, [maidId]);

//   if (loading) {
//     return <View style={styles.center}><ActivityIndicator size="large" color="#4285F4"/></View>;
//   }

//   if (feedback.length === 0) {
//     return (
//       <View style={styles.center}>
//         <Text>No feedback available for this maid.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={feedback}
//         keyExtractor={(_, index) => index.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.item}>
//             <Text style={styles.comment}>{item.comment}</Text>
//             <Text style={styles.rating}>Rating: {item.rating}</Text>
//           </View>
//         )}
//         contentContainerStyle={styles.list}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex:1, backgroundColor:'#f7f7f7' },
//   list: { padding:16 },
//   item: { padding:12, backgroundColor:'#fff', marginBottom:12, borderRadius:8 },
//   comment: { fontSize:14, marginBottom:4 },
//   rating: { fontSize:12, color:'#666' },
//   center: { flex:1, justifyContent:'center', alignItems:'center' }
// });
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RouteProp } from '@react-navigation/native'
import { AdminMaidsStackParamList } from '../../navigation/AdminMaidsStack'

type FeedbackRouteProp = RouteProp<AdminMaidsStackParamList, 'MaidFeedback'>

interface Props {
  route: FeedbackRouteProp
}

interface FeedbackItem {
  userId: string
  rating: number
  review: string
  createdAt: string
  [key: string]: any
}

export default function MaidFeedbackScreen({ route }: Props) {
  const { maidId } = route.params
  const [token, setToken] = useState<string>('')
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])  // always an array
  const [loading, setLoading] = useState<boolean>(true)

  // Load auth token once
  useEffect(() => {
    ;(async () => {
      const rawUser = await AsyncStorage.getItem('user')
      if (rawUser) {
        try {
          const userObj = JSON.parse(rawUser)
          setToken(userObj.token || '')
        } catch {
          console.error('Failed to parse stored user')
        }
      }
    })()
  }, [])

  // Fetch feedback once we have a token
  useEffect(() => {
    if (!token) return

    setLoading(true)
    axios
      .get<{ feedback?: FeedbackItem[] }>(
        `https://maid-in-india-nglj.onrender.com/api/worker/feedback/${maidId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        // safely default to empty array if API uses `feedback: null` or missing
        setFeedback(res.data.feedback ?? [])
      })
      .catch(err => console.error('Error fetching feedback:', err))
      .finally(() => setLoading(false))
  }, [maidId, token])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    )
  }

  if (feedback.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No feedback available for this maid.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedback}
        keyExtractor={item => item._id || item.createdAt}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.comment}>{item.review}</Text>
            <Text style={styles.rating}>Rating: {item.rating}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  list: { padding: 16 },
  item: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
  },
  comment: { fontSize: 14, marginBottom: 4 },
  rating: { fontSize: 12, color: '#666' },
  date: { fontSize: 10, color: '#999', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})
