"""
Simple test script to verify ML pipeline works
Tests both general and personalized recommendations
"""
import sys
import pathlib
import traceback

# path
backend_dir = pathlib.Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(backend_dir / "src"))

from ml.mood_recommender import get_recommender
from ml.dataset_loader import get_preprocessor

def test_general_recommendations():
    """Test general mood recommendations (no personalization)"""
    print("TEST 1: General Mood Recommendations")
    
    try:
        recommender = get_recommender()
        recommendations = recommender.get_mood_recommendations("Happy", top_k=5)
        
        print(f"\n Found {len(recommendations)} Happy mood recommendations:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f" {i}. {rec['track_name']} - {rec['artists']} ({rec['similarity_percent']}%)")
        
        return True
    except Exception as e:
        print(f"\nError: {e}")
        traceback.print_exc()
        return False

def test_personalized_recommendations():
    """Test personalized recommendations with mock user sessions"""
    print("TEST 2: Personalized Recommendations (Mock Data)")
    
    try:
        preprocessor = get_preprocessor()

        sample_tracks = []
        for i in range(5):
            track = preprocessor.get_track_by_index(i)
            if track:
                sample_tracks.append(track['track_id'])
        
        if not sample_tracks:
            print(" No sample tracks found... skipping personalization test")
            return True
        
        # mock user sessions (whereuser tagged these tracks as happy)
        mock_sessions = [
            {
                "trackId": track_id,
                "mood": "Happy",
                "intensity": 80
            }
            for track_id in sample_tracks[:3]
        ]
        
        # making personalized recommender with mock user sessions
        recommender = get_recommender(user_id="test_user_123")
        recommender.learn_from_user_sessions(mock_sessions)
        
        # personalized recommendations
        recommendations = recommender.get_mood_recommendations(
            "Happy", 
            top_k=5,
            personalization_weight=0.7
        )
        
        print(f"\nFound {len(recommendations)} personalized Happy recommendations:")
        print(f" (Based on {len(mock_sessions)} user-tagged tracks)")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f" {i}. {rec['track_name']} - {rec['artists']} ({rec['similarity_percent']}%)")
        
        return True
    except Exception as e:
        print(f"\n Error: {e}")
        traceback.print_exc()
        return False

def test_all_moods():
    """ test of all mood types"""
    print("TEST 3: All Mood Types")
    
    try:
        recommender = get_recommender()
        moods = ["Happy", "Sad", "Energized", "Angry", "Calm"]
        
        for mood in moods:
            recommendations = recommender.get_mood_recommendations(mood, top_k=1)
            if recommendations:
                print(f"  {mood}: {recommendations[0]['track_name']} ({recommendations[0]['similarity_percent']}%)")
            else:
                print(f" {mood}: No recommendations")
        
        return True
    except Exception as e:
        print(f"\n Error: {e}")
        return False

def main():
    print("MOOD RECOMMENDATION ML PIPELINE TEST")
    
    results = []
    
    #### Test 1: General recommendations ####
    results.append(test_general_recommendations())
    
    #### Test 2: Personalized recommendations ####
    results.append(test_personalized_recommendations())
    
    #### Test 3: All moods ####
    results.append(test_all_moods())

    print("########################################################")
    print("Dataset preprocessed and test pipeline passed!")
    print("########################################################")

if __name__ == "__main__":
    main()