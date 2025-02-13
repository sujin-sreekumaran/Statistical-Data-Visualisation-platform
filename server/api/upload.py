import matplotlib
matplotlib.use('Agg')  # Set the backend to 'Agg' to avoid GUI issues

from flask import Blueprint, request, send_file
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
from scipy.stats import skew, kurtosis

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    
    # Determine whether it's CSV or Excel
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(file)
    else:
        return 'Invalid file format', 400

    try:
        # Create visualizations in a single column layout
        fig, axes = plt.subplots(4, 1, figsize=(16, 24))  # Increased width to 16 for better fit
        
        # Visualization 1: Curve Plot
        numeric_df = df.select_dtypes(include=['number'])
        if not numeric_df.empty and numeric_df.shape[1] > 0:
            axes[0].plot(numeric_df.index, numeric_df[numeric_df.columns[0]], label=numeric_df.columns[0])
            axes[0].legend()
            axes[0].set_title('Curve Plot')
        
        # Visualization 2: Histogram
        if not numeric_df.empty and numeric_df.shape[1] > 0:
            sns.histplot(numeric_df[numeric_df.columns[0]], ax=axes[1])
            axes[1].set_title('Histogram')
        
        # Visualization 3: Box Plot
        if not numeric_df.empty and numeric_df.shape[1] > 0:
            sns.boxplot(data=numeric_df, ax=axes[2])
            axes[2].set_title('Box Plot')
        
        # Visualization 4: Pair Plot
        if not numeric_df.empty and numeric_df.shape[1] > 1:
            sns.pairplot(numeric_df)
            axes[3].set_title('Pair Plot')
        
        plt.tight_layout()
        
        # Save the plot to a BytesIO object
        img_io = io.BytesIO()
        fig.savefig(img_io, format='png')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        return str(e), 500
